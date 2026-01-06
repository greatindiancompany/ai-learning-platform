import { supabase } from '../utils/supabaseClient.js';
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
});

// ============================================
// 1. DRAW/SKETCH TOOL
// ============================================

export const getSketches = async (req, res) => {
  try {
    const student_id = req.student_id;

    const { data, error } = await supabase
      .from('student_sketches')
      .select('*')
      .eq('student_id', student_id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json({ success: true, sketches: data });
  } catch (error) {
    console.error('Error fetching sketches:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

export const createSketch = async (req, res) => {
  try {
    const student_id = req.student_id;
    const { title, subject, canvas_data, thumbnail_url } = req.body;

    const { data, error } = await supabase
      .from('student_sketches')
      .insert([{ student_id, title, subject, canvas_data, thumbnail_url }])
      .select()
      .single();

    if (error) throw error;
    res.json({ success: true, sketch: data });
  } catch (error) {
    console.error('Error creating sketch:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

export const updateSketch = async (req, res) => {
  try {
    const student_id = req.student_id;
    const { id } = req.params;
    const { title, subject, canvas_data, thumbnail_url } = req.body;

    const { data, error } = await supabase
      .from('student_sketches')
      .update({ title, subject, canvas_data, thumbnail_url })
      .eq('id', id)
      .eq('student_id', student_id)
      .select()
      .single();

    if (error) throw error;
    res.json({ success: true, sketch: data });
  } catch (error) {
    console.error('Error updating sketch:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

export const deleteSketch = async (req, res) => {
  try {
    const student_id = req.student_id;
    const { id } = req.params;

    const { error } = await supabase
      .from('student_sketches')
      .delete()
      .eq('id', id)
      .eq('student_id', student_id);

    if (error) throw error;
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting sketch:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// ============================================
// 2. QUIZ GENERATOR TOOL
// ============================================

export const generateQuiz = async (req, res) => {
  try {
    const student_id = req.student_id;
    const { topic, difficulty, questionCount } = req.body;

    // Generate quiz questions using Claude API
    const prompt = `Generate ${questionCount} ${difficulty} difficulty multiple-choice quiz questions about: ${topic}

Requirements:
- Each question should have exactly 4 options (A, B, C, D)
- Mark the correct answer with the letter (A, B, C, or D)
- Questions should be appropriate for ${difficulty} difficulty level
- Cover different aspects of the topic
- Make options plausible but clearly distinguishable

Return ONLY a JSON array in this exact format:
[
  {
    "question": "Question text here?",
    "options": ["Option A text", "Option B text", "Option C text", "Option D text"],
    "correct_answer": "A"
  }
]

No additional text, just the JSON array.`;

    const message = await anthropic.messages.create({
      model: process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-5-20250929',
      max_tokens: 4096,
      temperature: 0.7,
      messages: [{
        role: 'user',
        content: prompt
      }]
    });

    // Parse Claude's response
    let questions = [];
    try {
      const responseText = message.content[0].text.trim();
      // Remove markdown code blocks if present
      const jsonText = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      questions = JSON.parse(jsonText);
    } catch (parseError) {
      console.error('Error parsing Claude response:', parseError);
      throw new Error('Failed to parse quiz questions from AI response');
    }

    const { data, error } = await supabase
      .from('student_quizzes')
      .insert([{
        student_id,
        title: `${topic} Quiz`,
        topic,
        difficulty,
        questions
      }])
      .select()
      .single();

    if (error) throw error;
    res.json({ success: true, quiz: data });
  } catch (error) {
    console.error('Error generating quiz:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getQuizzes = async (req, res) => {
  try {
    const student_id = req.student_id;

    const { data, error } = await supabase
      .from('student_quizzes')
      .select('*')
      .eq('student_id', student_id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json({ success: true, quizzes: data });
  } catch (error) {
    console.error('Error fetching quizzes:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

export const submitQuizAttempt = async (req, res) => {
  try {
    const student_id = req.student_id;
    const { quiz_id, answers, score, total_questions } = req.body;

    const { data, error } = await supabase
      .from('student_quiz_attempts')
      .insert([{ student_id, quiz_id, answers, score, total_questions }])
      .select()
      .single();

    if (error) throw error;
    res.json({ success: true, attempt: data });
  } catch (error) {
    console.error('Error submitting quiz attempt:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// ============================================
// 3. FLASHCARDS TOOL
// ============================================

export const getFlashcardDecks = async (req, res) => {
  try {
    const student_id = req.student_id;

    const { data, error } = await supabase
      .from('student_flashcard_decks')
      .select(`
        *,
        cards:student_flashcards(count)
      `)
      .eq('student_id', student_id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json({ success: true, decks: data });
  } catch (error) {
    console.error('Error fetching flashcard decks:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

export const createFlashcardDeck = async (req, res) => {
  try {
    const student_id = req.student_id;
    const { name, subject, description } = req.body;

    const { data, error } = await supabase
      .from('student_flashcard_decks')
      .insert([{ student_id, name, subject, description }])
      .select()
      .single();

    if (error) throw error;
    res.json({ success: true, deck: data });
  } catch (error) {
    console.error('Error creating flashcard deck:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getFlashcards = async (req, res) => {
  try {
    const { deck_id } = req.params;

    const { data, error } = await supabase
      .from('student_flashcards')
      .select('*')
      .eq('deck_id', deck_id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json({ success: true, cards: data });
  } catch (error) {
    console.error('Error fetching flashcards:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

export const createFlashcard = async (req, res) => {
  try {
    const { deck_id, front, back } = req.body;

    const { data, error } = await supabase
      .from('student_flashcards')
      .insert([{ deck_id, front, back }])
      .select()
      .single();

    if (error) throw error;
    res.json({ success: true, card: data });
  } catch (error) {
    console.error('Error creating flashcard:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

export const updateFlashcardMastery = async (req, res) => {
  try {
    const { id } = req.params;
    const { mastery_level } = req.body;

    const { data, error } = await supabase
      .from('student_flashcards')
      .update({ mastery_level, last_reviewed_at: new Date() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    res.json({ success: true, card: data });
  } catch (error) {
    console.error('Error updating flashcard mastery:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// ============================================
// 4. PRACTICE TESTS TOOL
// ============================================

export const getPracticeTests = async (req, res) => {
  try {
    const student_id = req.student_id;

    const { data, error } = await supabase
      .from('student_practice_tests')
      .select('*')
      .eq('student_id', student_id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json({ success: true, tests: data });
  } catch (error) {
    console.error('Error fetching practice tests:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

export const createPracticeTest = async (req, res) => {
  try {
    const student_id = req.student_id;
    const { title, subject, duration_minutes, questions } = req.body;

    const { data, error } = await supabase
      .from('student_practice_tests')
      .insert([{ student_id, title, subject, duration_minutes, questions }])
      .select()
      .single();

    if (error) throw error;
    res.json({ success: true, test: data });
  } catch (error) {
    console.error('Error creating practice test:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

export const submitTestAttempt = async (req, res) => {
  try {
    const student_id = req.student_id;
    const { test_id, answers, score, total_questions, time_spent_seconds } = req.body;

    const { data, error } = await supabase
      .from('student_test_attempts')
      .insert([{ student_id, test_id, answers, score, total_questions, time_spent_seconds }])
      .select()
      .single();

    if (error) throw error;
    res.json({ success: true, attempt: data });
  } catch (error) {
    console.error('Error submitting test attempt:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// ============================================
// 5. STUDY TIMER TOOL
// ============================================

export const getStudySessions = async (req, res) => {
  try {
    const student_id = req.student_id;
    const { date } = req.query;

    let query = supabase
      .from('student_study_sessions')
      .select('*')
      .eq('student_id', student_id);

    if (date) {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);

      query = query
        .gte('started_at', startOfDay.toISOString())
        .lte('started_at', endOfDay.toISOString());
    }

    const { data, error } = await query.order('started_at', { ascending: false });

    if (error) throw error;
    res.json({ success: true, sessions: data });
  } catch (error) {
    console.error('Error fetching study sessions:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

export const startStudySession = async (req, res) => {
  try {
    const student_id = req.student_id;
    const { task_name, subject, duration_minutes } = req.body;

    const { data, error } = await supabase
      .from('student_study_sessions')
      .insert([{ student_id, task_name, subject, duration_minutes }])
      .select()
      .single();

    if (error) throw error;
    res.json({ success: true, session: data });
  } catch (error) {
    console.error('Error starting study session:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

export const completeStudySession = async (req, res) => {
  try {
    const student_id = req.student_id;
    const { id } = req.params;

    const { data, error } = await supabase
      .from('student_study_sessions')
      .update({ completed: true, completed_at: new Date() })
      .eq('id', id)
      .eq('student_id', student_id)
      .select()
      .single();

    if (error) throw error;
    res.json({ success: true, session: data });
  } catch (error) {
    console.error('Error completing study session:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// ============================================
// 6. HABIT TRACKER TOOL
// ============================================

export const getHabits = async (req, res) => {
  try {
    const student_id = req.student_id;

    const { data, error } = await supabase
      .from('student_habits')
      .select(`
        *,
        completions:student_habit_completions(count)
      `)
      .eq('student_id', student_id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json({ success: true, habits: data });
  } catch (error) {
    console.error('Error fetching habits:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

export const createHabit = async (req, res) => {
  try {
    const student_id = req.student_id;
    const { name, description, frequency, target_count } = req.body;

    const { data, error } = await supabase
      .from('student_habits')
      .insert([{ student_id, name, description, frequency, target_count }])
      .select()
      .single();

    if (error) throw error;
    res.json({ success: true, habit: data });
  } catch (error) {
    console.error('Error creating habit:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

export const completeHabit = async (req, res) => {
  try {
    const { habit_id, notes } = req.body;

    const { data, error } = await supabase
      .from('student_habit_completions')
      .insert([{ habit_id, notes }])
      .select()
      .single();

    if (error) throw error;
    res.json({ success: true, completion: data });
  } catch (error) {
    console.error('Error completing habit:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// ============================================
// 8. STUDY MUSIC TOOL
// ============================================

export const getMusicPlaylists = async (req, res) => {
  try {
    const student_id = req.student_id;

    const { data, error } = await supabase
      .from('student_music_playlists')
      .select('*')
      .eq('student_id', student_id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json({ success: true, playlists: data });
  } catch (error) {
    console.error('Error fetching music playlists:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

export const createMusicPlaylist = async (req, res) => {
  try {
    const student_id = req.student_id;
    const { name, genre, tracks } = req.body;

    const { data, error } = await supabase
      .from('student_music_playlists')
      .insert([{ student_id, name, genre, tracks }])
      .select()
      .single();

    if (error) throw error;
    res.json({ success: true, playlist: data });
  } catch (error) {
    console.error('Error creating music playlist:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

export const logMusicPlay = async (req, res) => {
  try {
    const student_id = req.student_id;
    const { track_name, genre } = req.body;

    const { data, error } = await supabase
      .from('student_music_history')
      .insert([{ student_id, track_name, genre }])
      .select()
      .single();

    if (error) throw error;
    res.json({ success: true, history: data });
  } catch (error) {
    console.error('Error logging music play:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// ============================================
// 9. IMAGE ANALYSIS TOOL
// ============================================

export const analyzeImage = async (req, res) => {
  try {
    const student_id = req.student_id;
    const { image_url, subject } = req.body;

    // Analyze image using Claude Vision API
    const message = await anthropic.messages.create({
      model: process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-5-20250929',
      max_tokens: 2048,
      messages: [{
        role: 'user',
        content: [
          {
            type: 'image',
            source: {
              type: 'base64',
              media_type: image_url.startsWith('data:image/png') ? 'image/png' : 'image/jpeg',
              data: image_url.split(',')[1] || image_url
            }
          },
          {
            type: 'text',
            text: `Analyze this image in the context of ${subject}. Provide:
1. A detailed description of what you see
2. Any text, formulas, or diagrams in the image
3. Explanations of concepts shown
4. If it's homework, provide hints (not full answers)
5. Relevant educational insights

Be helpful and educational.`
          }
        ]
      }]
    });

    const analysis_result = message.content[0].text;

    const { data, error } = await supabase
      .from('student_image_analyses')
      .insert([{ student_id, image_url, analysis_result, subject }])
      .select()
      .single();

    if (error) throw error;
    res.json({ success: true, analysis: data });
  } catch (error) {
    console.error('Error analyzing image:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getImageAnalyses = async (req, res) => {
  try {
    const student_id = req.student_id;

    const { data, error } = await supabase
      .from('student_image_analyses')
      .select('*')
      .eq('student_id', student_id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json({ success: true, analyses: data });
  } catch (error) {
    console.error('Error fetching image analyses:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// ============================================
// 10. MATH SOLVER TOOL
// ============================================

export const solveMathProblem = async (req, res) => {
  try {
    const student_id = req.student_id;
    const { problem, topic } = req.body;

    // Generate step-by-step solution using Claude API
    const prompt = `Solve this ${topic} problem step-by-step:

${problem}

Provide a detailed solution with:
1. Each step clearly numbered and explained
2. Mathematical notation using LaTeX format (wrap in $ for inline or $$ for block)
3. Clear reasoning for each step
4. A final answer at the end

Format your response as JSON:
{
  "steps": [
    "Step 1: Explanation with $math$ notation",
    "Step 2: Continue solving...",
    ...
  ],
  "final_answer": "The final answer with $$latex$$ notation if needed"
}

Only return the JSON object, no additional text.`;

    const message = await anthropic.messages.create({
      model: process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-5-20250929',
      max_tokens: 4096,
      temperature: 0.3, // Lower temperature for more precise math
      system: 'You are a math tutor. You MUST respond ONLY with valid JSON. Do not include any explanation, preamble, or text outside the JSON structure.',
      messages: [{
        role: 'user',
        content: prompt
      }]
    });

    // Parse Claude's response
    let solution = { steps: [], final_answer: "" };
    try {
      const responseText = message.content[0].text.trim();
      // Remove markdown code blocks if present
      let jsonText = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

      // Try to extract JSON if Claude added preamble text
      const jsonMatch = jsonText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        jsonText = jsonMatch[0];
      }

      const parsed = JSON.parse(jsonText);
      solution = {
        steps: parsed.steps || [],
        final_answer: parsed.final_answer || ""
      };
    } catch (parseError) {
      console.error('Error parsing Claude response:', parseError);
      console.error('Raw response:', message.content[0].text);
      throw new Error('Failed to parse math solution from AI response');
    }

    const { data, error } = await supabase
      .from('student_math_problems')
      .insert([{ student_id, problem, solution, topic }])
      .select()
      .single();

    if (error) throw error;
    res.json({ success: true, mathProblem: data });
  } catch (error) {
    console.error('Error solving math problem:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getMathProblems = async (req, res) => {
  try {
    const student_id = req.student_id;

    const { data, error } = await supabase
      .from('student_math_problems')
      .select('*')
      .eq('student_id', student_id)
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) throw error;
    res.json({ success: true, problems: data });
  } catch (error) {
    console.error('Error fetching math problems:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// ============================================
// 11. SCIENCE LAB TOOL
// ============================================

export const getExperiments = async (req, res) => {
  try {
    const student_id = req.student_id;

    const { data, error } = await supabase
      .from('student_experiments')
      .select('*')
      .eq('student_id', student_id)
      .order('created_at', { ascending: false});

    if (error) throw error;
    res.json({ success: true, experiments: data });
  } catch (error) {
    console.error('Error fetching experiments:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

export const createExperiment = async (req, res) => {
  try {
    const student_id = req.student_id;
    const { title, subject, experiment_type, data, notes } = req.body;

    const { data: experiment, error } = await supabase
      .from('student_experiments')
      .insert([{ student_id, title, subject, experiment_type, data, notes }])
      .select()
      .single();

    if (error) throw error;
    res.json({ success: true, experiment });
  } catch (error) {
    console.error('Error creating experiment:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// ============================================
// 12. VISUAL LEARNING TOOL
// ============================================

export const getVisualLearning = async (req, res) => {
  try {
    const student_id = req.student_id;

    const { data, error } = await supabase
      .from('student_visual_learning')
      .select('*')
      .eq('student_id', student_id)
      .order('updated_at', { ascending: false });

    if (error) throw error;
    res.json({ success: true, visuals: data });
  } catch (error) {
    console.error('Error fetching visual learning:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

export const createVisualLearning = async (req, res) => {
  try {
    const student_id = req.student_id;
    const { title, type, content, subject } = req.body;

    const { data, error } = await supabase
      .from('student_visual_learning')
      .insert([{ student_id, title, type, content, subject }])
      .select()
      .single();

    if (error) throw error;
    res.json({ success: true, visual: data });
  } catch (error) {
    console.error('Error creating visual learning:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

export const updateVisualLearning = async (req, res) => {
  try {
    const student_id = req.student_id;
    const { id } = req.params;
    const { title, content, subject } = req.body;

    const { data, error } = await supabase
      .from('student_visual_learning')
      .update({ title, content, subject })
      .eq('id', id)
      .eq('student_id', student_id)
      .select()
      .single();

    if (error) throw error;
    res.json({ success: true, visual: data });
  } catch (error) {
    console.error('Error updating visual learning:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// ============================================
// 13. NOTES SYNC TOOL
// ============================================

export const getNotes = async (req, res) => {
  try {
    const student_id = req.student_id;
    const { subject } = req.query;

    let query = supabase
      .from('student_notes')
      .select('*')
      .eq('student_id', student_id);

    if (subject) {
      query = query.eq('subject', subject);
    }

    const { data, error } = await query.order('updated_at', { ascending: false });

    if (error) throw error;
    res.json({ success: true, notes: data });
  } catch (error) {
    console.error('Error fetching notes:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

export const createNote = async (req, res) => {
  try {
    const student_id = req.student_id;
    const { title, subject, cue_column, notes_column, summary, source } = req.body;

    const { data, error } = await supabase
      .from('student_notes')
      .insert([{ student_id, title, subject, cue_column, notes_column, summary, source }])
      .select()
      .single();

    if (error) throw error;
    res.json({ success: true, note: data });
  } catch (error) {
    console.error('Error creating note:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

export const updateNote = async (req, res) => {
  try {
    const student_id = req.student_id;
    const { id } = req.params;
    const { title, subject, cue_column, notes_column, summary } = req.body;

    const { data, error } = await supabase
      .from('student_notes')
      .update({ title, subject, cue_column, notes_column, summary })
      .eq('id', id)
      .eq('student_id', student_id)
      .select()
      .single();

    if (error) throw error;
    res.json({ success: true, note: data });
  } catch (error) {
    console.error('Error updating note:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

export const deleteNote = async (req, res) => {
  try {
    const student_id = req.student_id;
    const { id } = req.params;

    const { error } = await supabase
      .from('student_notes')
      .delete()
      .eq('id', id)
      .eq('student_id', student_id);

    if (error) throw error;
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting note:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// ============================================
// 14. AI PLANNER TOOL
// ============================================

export const getStudyPlans = async (req, res) => {
  try {
    const student_id = req.student_id;

    const { data, error } = await supabase
      .from('student_study_plans')
      .select(`
        *,
        tasks:student_study_tasks(count)
      `)
      .eq('student_id', student_id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json({ success: true, plans: data });
  } catch (error) {
    console.error('Error fetching study plans:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

export const createStudyPlan = async (req, res) => {
  try {
    const student_id = req.student_id;
    const { title, start_date, end_date, subjects, schedule } = req.body;

    const { data, error } = await supabase
      .from('student_study_plans')
      .insert([{ student_id, title, start_date, end_date, subjects, schedule }])
      .select()
      .single();

    if (error) throw error;
    res.json({ success: true, plan: data });
  } catch (error) {
    console.error('Error creating study plan:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getStudyTasks = async (req, res) => {
  try {
    const student_id = req.student_id;
    const { plan_id } = req.query;

    let query = supabase
      .from('student_study_tasks')
      .select('*')
      .eq('student_id', student_id);

    if (plan_id) {
      query = query.eq('plan_id', plan_id);
    }

    const { data, error } = await query.order('due_date', { ascending: true });

    if (error) throw error;
    res.json({ success: true, tasks: data });
  } catch (error) {
    console.error('Error fetching study tasks:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

export const createStudyTask = async (req, res) => {
  try {
    const student_id = req.student_id;
    const { plan_id, title, subject, due_date, priority } = req.body;

    const { data, error } = await supabase
      .from('student_study_tasks')
      .insert([{ student_id, plan_id, title, subject, due_date, priority }])
      .select()
      .single();

    if (error) throw error;
    res.json({ success: true, task: data });
  } catch (error) {
    console.error('Error creating study task:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

export const completeStudyTask = async (req, res) => {
  try {
    const student_id = req.student_id;
    const { id } = req.params;

    const { data, error } = await supabase
      .from('student_study_tasks')
      .update({ completed: true })
      .eq('id', id)
      .eq('student_id', student_id)
      .select()
      .single();

    if (error) throw error;
    res.json({ success: true, task: data });
  } catch (error) {
    console.error('Error completing study task:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// ============================================
// 15. GOAL SETTER TOOL
// ============================================

export const getGoals = async (req, res) => {
  try {
    const student_id = req.student_id;

    const { data, error } = await supabase
      .from('student_goals')
      .select(`
        *,
        milestones:student_goal_milestones(*)
      `)
      .eq('student_id', student_id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json({ success: true, goals: data });
  } catch (error) {
    console.error('Error fetching goals:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

export const createGoal = async (req, res) => {
  try {
    const student_id = req.student_id;
    const { title, description, category, target_date } = req.body;

    const { data, error } = await supabase
      .from('student_goals')
      .insert([{ student_id, title, description, category, target_date }])
      .select()
      .single();

    if (error) throw error;
    res.json({ success: true, goal: data });
  } catch (error) {
    console.error('Error creating goal:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

export const updateGoalProgress = async (req, res) => {
  try {
    const student_id = req.student_id;
    const { id } = req.params;
    const { progress, status } = req.body;

    const { data, error } = await supabase
      .from('student_goals')
      .update({ progress, status })
      .eq('id', id)
      .eq('student_id', student_id)
      .select()
      .single();

    if (error) throw error;
    res.json({ success: true, goal: data });
  } catch (error) {
    console.error('Error updating goal progress:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

export const createGoalMilestone = async (req, res) => {
  try {
    const { goal_id, title } = req.body;

    const { data, error } = await supabase
      .from('student_goal_milestones')
      .insert([{ goal_id, title }])
      .select()
      .single();

    if (error) throw error;
    res.json({ success: true, milestone: data });
  } catch (error) {
    console.error('Error creating goal milestone:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

export const completeMilestone = async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from('student_goal_milestones')
      .update({ completed: true, completed_at: new Date() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    res.json({ success: true, milestone: data });
  } catch (error) {
    console.error('Error completing milestone:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};
