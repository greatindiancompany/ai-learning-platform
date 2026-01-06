import React from 'react';
import { AlertCircle, ShieldAlert, XCircle } from 'lucide-react';

const ContentPolicyError = ({ error, onDismiss }) => {
  if (!error) return null;

  const getCategoryInfo = (reason) => {
    const categoryMap = {
      violence: {
        title: 'Violence & Harm',
        description: 'Content related to violence, weapons, or self-harm',
        icon: ShieldAlert,
        color: 'red'
      },
      explicit: {
        title: 'Inappropriate Content',
        description: 'Sexually explicit or adult content',
        icon: ShieldAlert,
        color: 'red'
      },
      drugs: {
        title: 'Substance-Related Content',
        description: 'Content about illegal drugs or substance abuse',
        icon: ShieldAlert,
        color: 'orange'
      },
      'personal-info': {
        title: 'Personal Information',
        description: 'Sharing sensitive personal data',
        icon: AlertCircle,
        color: 'yellow'
      },
      bullying: {
        title: 'Bullying & Harassment',
        description: 'Content that could be hurtful or harassing',
        icon: ShieldAlert,
        color: 'red'
      },
      jailbreak: {
        title: 'System Manipulation',
        description: 'Attempts to bypass safety guidelines',
        icon: AlertCircle,
        color: 'orange'
      },
      default: {
        title: 'Content Policy Violation',
        description: 'Your message didn\'t meet our content guidelines',
        icon: AlertCircle,
        color: 'orange'
      }
    };

    return categoryMap[reason] || categoryMap.default;
  };

  const category = getCategoryInfo(error.reason);
  const Icon = category.icon;

  const colorClasses = {
    red: 'bg-red-50 border-red-200',
    orange: 'bg-orange-50 border-orange-200',
    yellow: 'bg-yellow-50 border-yellow-200'
  };

  const iconColorClasses = {
    red: 'text-red-600',
    orange: 'text-orange-600',
    yellow: 'text-yellow-600'
  };

  const textColorClasses = {
    red: 'text-red-800',
    orange: 'text-orange-800',
    yellow: 'text-yellow-800'
  };

  return (
    <div className={`mb-4 p-4 rounded-lg border-2 ${colorClasses[category.color]} animate-fade-in`}>
      <div className="flex items-start gap-3">
        <Icon className={`w-6 h-6 mt-0.5 flex-shrink-0 ${iconColorClasses[category.color]}`} />

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-2">
            <h3 className={`font-semibold text-lg ${textColorClasses[category.color]}`}>
              Message Blocked
            </h3>
            {onDismiss && (
              <button
                onClick={onDismiss}
                className={`flex-shrink-0 ${iconColorClasses[category.color]} hover:opacity-70 transition-opacity`}
                aria-label="Dismiss"
              >
                <XCircle className="w-5 h-5" />
              </button>
            )}
          </div>

          <p className={`text-sm mb-3 ${textColorClasses[category.color]}`}>
            {error.message || 'Your message was blocked because it violated our content policies.'}
          </p>

          <div className={`text-sm ${textColorClasses[category.color]} bg-white bg-opacity-50 p-3 rounded`}>
            <p className="font-medium mb-1">{category.title}</p>
            <p className="text-sm opacity-90 mb-3">{category.description}</p>

            <div className="space-y-2">
              <p className="font-medium">Our platform doesn't allow:</p>
              <ul className="list-disc list-inside space-y-1 ml-2 text-sm opacity-90">
                <li>Violence, weapons, or content that could cause harm</li>
                <li>Explicit, inappropriate, or adult content</li>
                <li>Discussion of illegal drugs or substances</li>
                <li>Sharing personal information like addresses or phone numbers</li>
                <li>Bullying, harassment, or hurtful language</li>
                <li>Attempts to bypass safety features</li>
              </ul>
            </div>
          </div>

          <div className="mt-3 pt-3 border-t border-current opacity-30">
            <p className={`text-sm ${textColorClasses[category.color]}`}>
              <strong>What you can do:</strong> Please rephrase your question or ask something different.
              If you need help, feel free to ask about learning topics, homework guidance, or general knowledge!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContentPolicyError;
