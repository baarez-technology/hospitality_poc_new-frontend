import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  FileText,
  Plus,
  Edit2,
  Trash2,
  X,
  Mail,
  MessageSquare,
  Copy,
  Check,
  Info,
  Sparkles,
  Wand2,
  Brain,
  Lightbulb,
  TestTube2,
  ChevronDown,
  ChevronUp,
  Loader2,
  TrendingUp,
  BookOpen,
  User,
  AlertCircle
} from 'lucide-react';
import { generateId, formatDate, PERSONALIZATION_TAGS } from '../../utils/crm';
import CustomDropdown from '../ui/CustomDropdown';

const TEMPLATE_TYPE_OPTIONS = [
  { value: 'email', label: 'Email' },
  { value: 'sms', label: 'SMS' }
];

const TEMPLATE_PURPOSE_OPTIONS = [
  { value: 'welcome', label: 'Welcome' },
  { value: 'win-back', label: 'Win-Back' },
  { value: 'loyalty', label: 'Loyalty Reward' },
  { value: 'upsell', label: 'Upsell' },
  { value: 'feedback', label: 'Feedback Request' },
  { value: 'special-offer', label: 'Special Offer' }
];

// AI Analysis Utilities
function analyzeTemplate(template) {
  const body = template.body || '';
  const subject = template.subject || '';

  // Count personalization tags
  const tagPattern = /\{\{[^}]+\}\}/g;
  const bodyTags = (body.match(tagPattern) || []).length;
  const subjectTags = (subject.match(tagPattern) || []).length;
  const totalTags = bodyTags + subjectTags;

  // Analyze message length
  const wordCount = body.split(/\s+/).filter(w => w.length > 0).length;
  const charCount = body.length;

  // Check for call-to-action
  const ctaPatterns = /\b(click|book|reserve|schedule|call|visit|shop|buy|order|sign up|register|join|get|claim|redeem|discover|explore|try|start|learn more)\b/i;
  const hasCTA = ctaPatterns.test(body);

  // Check for urgency words
  const urgencyPatterns = /\b(limited|hurry|now|today|exclusive|last chance|don't miss|expires|ending soon|act fast|only)\b/i;
  const hasUrgency = urgencyPatterns.test(body);

  // Readability estimation (simplified Flesch-Kincaid)
  const sentences = body.split(/[.!?]+/).filter(s => s.trim().length > 0).length || 1;
  const syllables = body.toLowerCase().replace(/[^a-z]/g, '').length / 3; // rough estimate
  const avgWordsPerSentence = wordCount / sentences;
  const avgSyllablesPerWord = syllables / (wordCount || 1);
  const readabilityScore = Math.min(100, Math.max(0, 206.835 - 1.015 * avgWordsPerSentence - 84.6 * avgSyllablesPerWord));

  // Calculate scores
  const personalizationScore = Math.min(100, totalTags * 20 + (bodyTags > 0 ? 20 : 0));

  // Predicted open rate based on multiple factors
  let predictedOpenRate = 25; // base rate
  if (subjectTags > 0) predictedOpenRate += 10;
  if (subject.length > 10 && subject.length < 50) predictedOpenRate += 8;
  if (hasUrgency) predictedOpenRate += 5;
  if (subject.includes('!')) predictedOpenRate -= 2;
  if (subject.toUpperCase() === subject && subject.length > 5) predictedOpenRate -= 10;
  predictedOpenRate = Math.min(65, Math.max(15, predictedOpenRate));

  // Generate suggestions
  const suggestions = [];
  if (totalTags === 0) {
    suggestions.push('Add personalization tags to increase engagement');
  }
  if (!hasCTA) {
    suggestions.push('Include a clear call-to-action');
  }
  if (template.type === 'email' && subject.length < 20) {
    suggestions.push('Consider a more descriptive subject line');
  }
  if (template.type === 'sms' && charCount > 160) {
    suggestions.push('SMS is over 160 characters - may be split into multiple messages');
  }
  if (wordCount < 20 && template.type === 'email') {
    suggestions.push('Email body may be too short - add more context');
  }
  if (wordCount > 300 && template.type === 'email') {
    suggestions.push('Consider shortening the message for better engagement');
  }
  if (!hasUrgency) {
    suggestions.push('Adding urgency words can improve response rates');
  }
  if (avgWordsPerSentence > 20) {
    suggestions.push('Use shorter sentences for better readability');
  }

  return {
    personalizationScore,
    readabilityScore: Math.round(readabilityScore),
    predictedOpenRate: Math.round(predictedOpenRate),
    suggestions,
    stats: {
      wordCount,
      charCount,
      tagCount: totalTags,
      hasCTA,
      hasUrgency
    }
  };
}

// AI Template Generation
const AI_TEMPLATES = {
  welcome: {
    email: {
      name: 'Welcome to Glimmora',
      subject: 'Welcome to the Glimmora family, {{guest.firstName}}!',
      body: `Dear {{guest.firstName}},

Welcome to Glimmora! We're thrilled to have you as part of our community.

Your wellness journey starts here. As a new member, you have access to:
- Personalized spa recommendations
- Exclusive member-only offers
- Priority booking for popular treatments

Book your first treatment today and experience the Glimmora difference.

Warm regards,
The Glimmora Team`
    },
    sms: {
      name: 'Welcome SMS',
      subject: null,
      body: `Hi {{guest.firstName}}! Welcome to Glimmora! As a new guest, enjoy 15% off your first treatment. Book now: glimmora.com/book`
    }
  },
  'win-back': {
    email: {
      name: 'We Miss You',
      subject: "{{guest.firstName}}, we've missed you!",
      body: `Hi {{guest.firstName}},

It's been a while since your last visit, and we miss seeing you at Glimmora!

We'd love to welcome you back with a special offer:
20% OFF your next treatment

This exclusive offer is just for you and expires in 7 days.

Ready to treat yourself? Book now and let us take care of you.

See you soon,
The Glimmora Team`
    },
    sms: {
      name: 'Win-Back SMS',
      subject: null,
      body: `Hi {{guest.firstName}}, we miss you! Come back to Glimmora and enjoy 20% off your next visit. Offer expires in 7 days. Book: glimmora.com`
    }
  },
  loyalty: {
    email: {
      name: 'Loyalty Reward',
      subject: '{{guest.firstName}}, you\'ve earned a reward!',
      body: `Dear {{guest.firstName}},

Thank you for being a valued Glimmora guest!

We're excited to let you know that you've earned a special loyalty reward:

FREE UPGRADE on your next treatment

As one of our most loyal guests, you deserve to be pampered. Use this reward on your next visit to experience our premium services.

Your reward is waiting,
The Glimmora Team`
    },
    sms: {
      name: 'Loyalty SMS',
      subject: null,
      body: `Congrats {{guest.firstName}}! You've earned a FREE upgrade at Glimmora. Redeem on your next visit. Thank you for your loyalty!`
    }
  },
  upsell: {
    email: {
      name: 'Upgrade Your Experience',
      subject: 'Enhance your Glimmora experience, {{guest.firstName}}',
      body: `Hi {{guest.firstName}},

Love your regular treatments? Take your wellness routine to the next level!

Discover our premium add-ons:
- Hot Stone Enhancement - $35
- Aromatherapy Upgrade - $25
- Extended Session (+30 min) - $45

For a limited time, add any upgrade at 15% off when you book your next appointment.

Elevate your experience,
The Glimmora Team`
    },
    sms: {
      name: 'Upsell SMS',
      subject: null,
      body: `{{guest.firstName}}, upgrade your next Glimmora treatment! Add aromatherapy or hot stones at 15% off. Limited time offer. Book now!`
    }
  },
  feedback: {
    email: {
      name: 'Feedback Request',
      subject: '{{guest.firstName}}, how was your visit?',
      body: `Hi {{guest.firstName}},

Thank you for visiting Glimmora! We hope you enjoyed your recent treatment.

Your feedback means everything to us. Would you take a moment to share your experience?

[Leave a Review]

As a thank you for your time, you'll receive 10% off your next booking.

We're always striving to improve,
The Glimmora Team`
    },
    sms: {
      name: 'Feedback SMS',
      subject: null,
      body: `Hi {{guest.firstName}}, thanks for visiting Glimmora! Share your feedback and get 10% off your next visit: glimmora.com/review`
    }
  },
  'special-offer': {
    email: {
      name: 'Special Offer',
      subject: 'Exclusive offer just for you, {{guest.firstName}}!',
      body: `Dear {{guest.firstName}},

You're receiving this because you're special to us!

For a LIMITED TIME ONLY:

30% OFF ANY TREATMENT

This exclusive offer is available only to select guests like you. Don't miss this opportunity to indulge in your favorite treatments at an incredible price.

Offer expires in 48 hours - book now!

Exclusively yours,
The Glimmora Team`
    },
    sms: {
      name: 'Special Offer SMS',
      subject: null,
      body: `{{guest.firstName}}, EXCLUSIVE: 30% off any treatment at Glimmora! Expires in 48 hours. Book now: glimmora.com/book`
    }
  }
};

// AI Assist Options
const AI_ASSIST_OPTIONS = [
  { value: 'improve-tone', label: 'Improve tone', icon: Sparkles },
  { value: 'make-shorter', label: 'Make shorter', icon: ChevronDown },
  { value: 'make-personal', label: 'Make more personal', icon: User },
  { value: 'add-urgency', label: 'Add urgency', icon: AlertCircle }
];

function applyAIAssist(text, action, type) {
  const lines = text.split('\n');

  switch (action) {
    case 'improve-tone':
      // Make more professional and warm
      return text
        .replace(/\bHi\b/g, 'Dear')
        .replace(/\bHey\b/gi, 'Hello')
        .replace(/\bthanks\b/gi, 'Thank you')
        .replace(/\bgreat\b/gi, 'wonderful')
        .replace(/\bgood\b/gi, 'excellent')
        .replace(/!{2,}/g, '!')
        .replace(/\bawesome\b/gi, 'exceptional');

    case 'make-shorter':
      // Remove filler words and shorten
      return text
        .replace(/\bjust\b\s*/gi, '')
        .replace(/\breally\b\s*/gi, '')
        .replace(/\bvery\b\s*/gi, '')
        .replace(/\bactually\b\s*/gi, '')
        .replace(/\bbasically\b\s*/gi, '')
        .replace(/\s+/g, ' ')
        .trim();

    case 'make-personal':
      // Add more personalization suggestions
      let personalText = text;
      if (!text.includes('{{guest.firstName}}')) {
        personalText = personalText.replace(/\bDear Guest\b/gi, 'Dear {{guest.firstName}}');
        personalText = personalText.replace(/\bHi there\b/gi, 'Hi {{guest.firstName}}');
      }
      if (!text.includes('{{guest.lastName}}') && text.includes('Dear {{guest.firstName}}')) {
        personalText = personalText.replace(/Dear {{guest.firstName}}/g, 'Dear {{guest.firstName}} {{guest.lastName}}');
      }
      return personalText;

    case 'add-urgency':
      // Add urgency elements
      let urgentText = text;
      if (!text.toLowerCase().includes('limited')) {
        urgentText = urgentText.replace(/\boffer\b/gi, 'limited-time offer');
      }
      if (!text.toLowerCase().includes('now')) {
        urgentText = urgentText.replace(/\bbook\b/gi, 'book now');
      }
      if (!text.toLowerCase().includes("don't miss")) {
        const lastLine = lines[lines.length - 1];
        if (lastLine && !lastLine.includes("Don't miss")) {
          urgentText += "\n\nDon't miss out - this offer won't last!";
        }
      }
      return urgentText;

    default:
      return text;
  }
}

function generateSubjectLine(body, purpose) {
  const suggestions = [];
  const firstName = '{{guest.firstName}}';

  // Analyze body for key themes
  const hasOffer = /\b(offer|discount|off|free|save)\b/i.test(body);
  const hasReward = /\b(reward|earn|loyalty|points)\b/i.test(body);
  const hasWelcome = /\b(welcome|new|join)\b/i.test(body);
  const hasFeedback = /\b(feedback|review|rate|opinion)\b/i.test(body);

  if (hasWelcome) {
    suggestions.push(`Welcome to the family, ${firstName}!`);
    suggestions.push(`${firstName}, your wellness journey starts here`);
  }
  if (hasOffer) {
    suggestions.push(`${firstName}, a special offer just for you!`);
    suggestions.push(`Exclusive savings inside, ${firstName}`);
  }
  if (hasReward) {
    suggestions.push(`${firstName}, you've earned something special!`);
    suggestions.push(`Your loyalty reward is waiting, ${firstName}`);
  }
  if (hasFeedback) {
    suggestions.push(`${firstName}, we'd love your feedback`);
    suggestions.push(`How was your visit, ${firstName}?`);
  }

  // Default suggestions
  if (suggestions.length === 0) {
    suggestions.push(`${firstName}, we have something special for you`);
    suggestions.push(`A message for you, ${firstName}`);
  }

  return suggestions;
}

function generateABTestVariants(template) {
  const variants = [];
  const analysis = analyzeTemplate(template);

  // Variant A: More urgency
  const variantA = {
    ...template,
    id: generateId(),
    name: `${template.name} - Variant A (Urgency)`,
    body: applyAIAssist(template.body, 'add-urgency', template.type),
    subject: template.subject ? template.subject.replace(/!?$/, ' - Limited Time!') : null
  };
  variants.push(variantA);

  // Variant B: More personal
  const variantB = {
    ...template,
    id: generateId(),
    name: `${template.name} - Variant B (Personal)`,
    body: applyAIAssist(template.body, 'make-personal', template.type),
    subject: template.subject ? template.subject.replace('!', ', we picked this just for you!') : null
  };
  variants.push(variantB);

  // Variant C: Shorter version
  if (analysis.stats.wordCount > 50) {
    const variantC = {
      ...template,
      id: generateId(),
      name: `${template.name} - Variant C (Concise)`,
      body: applyAIAssist(template.body, 'make-shorter', template.type),
      subject: template.subject
    };
    variants.push(variantC);
  }

  return variants;
}

// Score Badge Component
function ScoreBadge({ score, label, icon: Icon, color }) {
  const getScoreColor = (score) => {
    if (score >= 70) return 'text-emerald-600 bg-emerald-50';
    if (score >= 40) return 'text-amber-600 bg-amber-50';
    return 'text-rose-600 bg-rose-50';
  };

  return (
    <div className={`flex items-center gap-1.5 px-2 py-1 rounded-[6px] ${color || getScoreColor(score)}`}>
      {Icon && <Icon className="w-3 h-3" />}
      <span className="text-[11px] font-medium">{score}%</span>
      <span className="text-[11px] opacity-75">{label}</span>
    </div>
  );
}

// AI Insights Panel Component
function AIInsightsPanel({ template, expanded, onToggle }) {
  const analysis = analyzeTemplate(template);

  return (
    <div className="mt-3 pt-3 border-t border-neutral-100">
      <button
        onClick={onToggle}
        className="flex items-center gap-2 text-xs text-[#5C9BA4] hover:text-[#5C9BA4]/80 transition-colors w-full"
      >
        <Brain className="w-3.5 h-3.5" />
        <span className="font-medium">AI Performance Insights</span>
        {expanded ? <ChevronUp className="w-3 h-3 ml-auto" /> : <ChevronDown className="w-3 h-3 ml-auto" />}
      </button>

      {expanded && (
        <div className="mt-3 space-y-3 animate-in slide-in-from-top-2 duration-200">
          {/* Score Badges */}
          <div className="flex flex-wrap gap-2">
            <ScoreBadge
              score={analysis.predictedOpenRate}
              label="Open Rate"
              icon={TrendingUp}
            />
            <ScoreBadge
              score={analysis.readabilityScore}
              label="Readability"
              icon={BookOpen}
            />
            <ScoreBadge
              score={analysis.personalizationScore}
              label="Personal"
              icon={User}
            />
          </div>

          {/* Stats */}
          <div className="flex gap-4 text-xs text-neutral-500">
            <span>{analysis.stats.wordCount} words</span>
            <span>{analysis.stats.charCount} chars</span>
            <span>{analysis.stats.tagCount} tags</span>
            {analysis.stats.hasCTA && <span className="text-emerald-600">Has CTA</span>}
            {analysis.stats.hasUrgency && <span className="text-amber-600">Has Urgency</span>}
          </div>

          {/* Suggestions */}
          {analysis.suggestions.length > 0 && (
            <div className="p-2.5 bg-[#CDB261]/10 border border-[#CDB261]/20 rounded-[6px]">
              <div className="flex items-center gap-1.5 text-xs font-medium text-[#CDB261] mb-1.5">
                <Lightbulb className="w-3.5 h-3.5" />
                Suggestions
              </div>
              <ul className="space-y-1">
                {analysis.suggestions.slice(0, 3).map((suggestion, idx) => (
                  <li key={idx} className="text-xs text-neutral-600 flex items-start gap-1.5">
                    <span className="text-[#CDB261] mt-0.5">-</span>
                    {suggestion}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// AI Generator Section Component
function AITemplateGenerator({ onGenerate, isGenerating }) {
  const [purpose, setPurpose] = useState('welcome');
  const [type, setType] = useState('email');
  const [generatedTemplate, setGeneratedTemplate] = useState(null);
  const [showGenerated, setShowGenerated] = useState(false);

  const handleGenerate = async () => {
    setShowGenerated(false);

    // Simulate AI generation delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    const template = AI_TEMPLATES[purpose]?.[type];
    if (template) {
      setGeneratedTemplate({
        ...template,
        type,
        purpose
      });
      setShowGenerated(true);
    }
  };

  const handleSave = () => {
    if (generatedTemplate) {
      onGenerate({
        id: generateId(),
        name: generatedTemplate.name,
        type: generatedTemplate.type,
        subject: generatedTemplate.subject,
        body: generatedTemplate.body,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      setShowGenerated(false);
      setGeneratedTemplate(null);
    }
  };

  return (
    <div className="mb-4 p-4 bg-neutral-50 border border-neutral-100 rounded-[8px]">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-9 h-9 rounded-[8px] bg-[#5C9BA4]/10 flex items-center justify-center">
          <Sparkles className="w-[18px] h-[18px] text-[#5C9BA4]" />
        </div>
        <div>
          <h4 className="text-[13px] font-semibold text-neutral-900">AI Template Generator</h4>
          <p className="text-[11px] text-neutral-400">Generate templates with AI assistance</p>
        </div>
      </div>

      <div className="flex flex-wrap items-end gap-3">
        <div className="flex-1 min-w-[140px]">
          <label className="text-[11px] font-semibold text-neutral-400 uppercase tracking-widest mb-1.5 block">Purpose</label>
          <CustomDropdown
            options={TEMPLATE_PURPOSE_OPTIONS}
            value={purpose}
            onChange={setPurpose}
            className="w-full"
          />
        </div>
        <div className="flex-1 min-w-[100px]">
          <label className="text-[11px] font-semibold text-neutral-400 uppercase tracking-widest mb-1.5 block">Type</label>
          <CustomDropdown
            options={TEMPLATE_TYPE_OPTIONS}
            value={type}
            onChange={setType}
            className="w-full"
          />
        </div>
        <button
          onClick={handleGenerate}
          disabled={isGenerating}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#A57865] text-white rounded-[8px] text-[13px] font-semibold hover:bg-[#8E6554] transition-colors disabled:opacity-50"
        >
          {isGenerating ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Wand2 className="w-4 h-4" />
          )}
          Generate Template
        </button>
      </div>

      {/* Generated Template Preview */}
      {showGenerated && generatedTemplate && (
        <div className="mt-4 p-4 bg-white border border-neutral-200 rounded-[8px] animate-in slide-in-from-top-2 duration-300">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#5C9BA4]" />
              <span className="text-sm font-medium text-neutral-900">Generated: {generatedTemplate.name}</span>
            </div>
            <span className={`px-2 py-0.5 text-xs rounded-full ${
              generatedTemplate.type === 'email'
                ? 'bg-[#4E5840]/10 text-[#4E5840]'
                : 'bg-[#5C9BA4]/10 text-[#5C9BA4]'
            }`}>
              {generatedTemplate.type.toUpperCase()}
            </span>
          </div>

          {generatedTemplate.subject && (
            <p className="text-sm text-neutral-700 mb-2">
              <span className="font-medium">Subject:</span> {generatedTemplate.subject}
            </p>
          )}

          <div className="p-3 bg-neutral-50 rounded-[6px] border border-neutral-100 max-h-32 overflow-y-auto">
            <p className="text-sm text-neutral-600 whitespace-pre-line font-mono text-xs">
              {generatedTemplate.body}
            </p>
          </div>

          <div className="flex items-center gap-2 mt-3">
            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-4 py-2 bg-[#4E5840] text-white rounded-[8px] text-[13px] font-semibold hover:bg-[#3d4632] transition-colors"
            >
              <Check className="w-4 h-4" />
              Save Template
            </button>
            <button
              onClick={() => setShowGenerated(false)}
              className="px-4 py-2 text-neutral-600 hover:bg-neutral-100 rounded-[8px] text-[13px] font-medium transition-colors"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// A/B Test Modal Component
function ABTestModal({ isOpen, onClose, template, onCreateTest }) {
  const [variants, setVariants] = useState([]);
  const [selectedVariants, setSelectedVariants] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isOpen && template) {
      setIsLoading(true);
      // Simulate AI processing
      setTimeout(() => {
        const generatedVariants = generateABTestVariants(template);
        setVariants(generatedVariants);
        setSelectedVariants([generatedVariants[0]?.id]);
        setIsLoading(false);
      }, 1000);
    }
  }, [isOpen, template]);

  const toggleVariant = (variantId) => {
    setSelectedVariants(prev =>
      prev.includes(variantId)
        ? prev.filter(id => id !== variantId)
        : [...prev, variantId]
    );
  };

  const handleCreate = () => {
    const selected = variants.filter(v => selectedVariants.includes(v.id));
    onCreateTest(template, selected);
    onClose();
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-50">
      <div className="fixed inset-0 bg-black/40" onClick={onClose} />
      <div className="fixed right-0 top-0 bottom-0 w-full sm:max-w-xl flex flex-col bg-white border-l border-neutral-200 shadow-2xl h-screen">
        {/* Header */}
        <div className="relative px-4 sm:px-6 py-4 sm:py-5 pr-12 sm:pr-14 border-b border-neutral-100 bg-white flex-shrink-0 z-10">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-9 h-9 rounded-[8px] bg-[#CDB261]/10 flex items-center justify-center flex-shrink-0">
              <TestTube2 className="w-[18px] h-[18px] text-[#CDB261]" />
            </div>
            <div className="min-w-0">
              <h2 className="text-[15px] font-semibold text-neutral-900">A/B Test Suggestions</h2>
              <p className="text-[12px] text-neutral-400 truncate">AI-generated variants for "{template?.name}"</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 rounded-[8px] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 sm:py-6 bg-white">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="w-8 h-8 text-[#5C9BA4] animate-spin mb-3" />
              <p className="text-sm text-neutral-500">Generating test variants...</p>
            </div>
          ) : (
            <div className="space-y-3 sm:space-y-4">
              {/* Original */}
              <div className="p-3 sm:p-4 border border-[#4E5840]/30 bg-[#4E5840]/5 rounded-[8px]">
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <span className="px-2 py-0.5 bg-[#4E5840] text-white text-[10px] sm:text-xs rounded-full">Original</span>
                  <span className="text-xs sm:text-sm font-medium text-neutral-900 truncate">{template?.name}</span>
                </div>
                <p className="text-[11px] sm:text-xs text-neutral-600 line-clamp-2">{template?.body}</p>
              </div>

              {/* Variants */}
              {variants.map((variant, idx) => (
                <div
                  key={variant.id}
                  className={`p-3 sm:p-4 border rounded-[8px] cursor-pointer transition-all ${
                    selectedVariants.includes(variant.id)
                      ? 'border-[#5C9BA4] bg-[#5C9BA4]/5'
                      : 'border-neutral-200 hover:border-neutral-300'
                  }`}
                  onClick={() => toggleVariant(variant.id)}
                >
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <input
                      type="checkbox"
                      checked={selectedVariants.includes(variant.id)}
                      onChange={() => toggleVariant(variant.id)}
                      className="w-4 h-4 text-[#5C9BA4] rounded border-neutral-300 focus:ring-[#5C9BA4]"
                    />
                    <span className="px-2 py-0.5 bg-[#5C9BA4]/10 text-[#5C9BA4] text-[10px] sm:text-xs rounded-full">Variant {String.fromCharCode(65 + idx)}</span>
                    <span className="text-xs sm:text-sm font-medium text-neutral-900 truncate">{variant.name}</span>
                  </div>
                  {variant.subject && (
                    <p className="text-[11px] sm:text-xs text-neutral-700 mb-1">
                      <span className="font-medium">Subject:</span> {variant.subject}
                    </p>
                  )}
                  <p className="text-[11px] sm:text-xs text-neutral-600 line-clamp-2">{variant.body}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex-shrink-0 border-t border-neutral-100 px-4 sm:px-6 py-4 bg-white">
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-3 sm:px-4 py-2.5 border border-neutral-200 text-neutral-700 rounded-[8px] text-[13px] font-medium hover:bg-neutral-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleCreate}
              disabled={selectedVariants.length === 0 || isLoading}
              className={`flex-1 px-3 sm:px-4 py-2.5 rounded-[8px] text-[13px] font-semibold transition-colors ${
                selectedVariants.length > 0 && !isLoading
                  ? 'bg-[#A57865] text-white hover:bg-[#8E6554]'
                  : 'bg-neutral-200 text-neutral-400 cursor-not-allowed'
              }`}
            >
              <span className="hidden sm:inline">Create A/B Test ({selectedVariants.length} variant{selectedVariants.length !== 1 ? 's' : ''})</span>
              <span className="sm:hidden">Create ({selectedVariants.length})</span>
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}

function TemplateModal({ isOpen, onClose, onSave, template, mode }) {
  const [formData, setFormData] = useState({
    name: template?.name || '',
    type: template?.type || 'email',
    subject: template?.subject || '',
    body: template?.body || ''
  });

  const [showTagsHelp, setShowTagsHelp] = useState(false);
  const [showAIAssist, setShowAIAssist] = useState(false);
  const [isAIProcessing, setIsAIProcessing] = useState(false);
  const [subjectSuggestions, setSubjectSuggestions] = useState([]);
  const [showSubjectSuggestions, setShowSubjectSuggestions] = useState(false);

  // ESC key handler and body scroll lock
  useEffect(() => {
    if (!isOpen) return;

    const handleEsc = (e) => {
      if (e.key === 'Escape') onClose();
    };

    document.addEventListener('keydown', handleEsc);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  // Sync form data when modal opens or template changes (fixes edit mode showing empty)
  useEffect(() => {
    if (isOpen) {
      setFormData({
        name: template?.name || '',
        type: template?.type || 'email',
        subject: template?.subject || '',
        body: template?.body || ''
      });
    }
  }, [isOpen, template]);

  // Reset AI states when modal opens
  useEffect(() => {
    if (isOpen) {
      setShowAIAssist(false);
      setShowSubjectSuggestions(false);
      setSubjectSuggestions([]);
    }
  }, [isOpen]);

  const handleSubmit = () => {
    if (!formData.name.trim() || !formData.body.trim()) return;
    if (formData.type === 'email' && !formData.subject.trim()) return;

    const templateData = {
      id: template?.id || generateId(),
      name: formData.name.trim(),
      type: formData.type,
      subject: formData.type === 'email' ? formData.subject.trim() : null,
      body: formData.body.trim(),
      createdAt: template?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    onSave(templateData);
    onClose();
  };

  const insertTag = (tag) => {
    setFormData(prev => ({
      ...prev,
      body: prev.body + tag
    }));
  };

  const handleAIAssist = async (action) => {
    setIsAIProcessing(true);
    setShowAIAssist(false);

    // Simulate AI processing
    await new Promise(resolve => setTimeout(resolve, 800));

    const newBody = applyAIAssist(formData.body, action, formData.type);
    setFormData(prev => ({ ...prev, body: newBody }));
    setIsAIProcessing(false);
  };

  const handleGenerateSubjectLine = async () => {
    setIsAIProcessing(true);

    // Simulate AI processing
    await new Promise(resolve => setTimeout(resolve, 600));

    const suggestions = generateSubjectLine(formData.body, '');
    setSubjectSuggestions(suggestions);
    setShowSubjectSuggestions(true);
    setIsAIProcessing(false);
  };

  const selectSubjectSuggestion = (subject) => {
    setFormData(prev => ({ ...prev, subject }));
    setShowSubjectSuggestions(false);
  };

  // SMS character analysis
  const getSMSAnalysis = () => {
    const charCount = formData.body.length;
    const segments = Math.ceil(charCount / 160) || 1;
    let status = 'optimal';
    let message = 'Optimal length';

    if (charCount > 160) {
      status = 'warning';
      message = `Will be split into ${segments} messages`;
    } else if (charCount > 140) {
      status = 'caution';
      message = 'Approaching limit';
    } else if (charCount < 50) {
      status = 'suggestion';
      message = 'Consider adding more context';
    }

    return { charCount, segments, status, message };
  };

  if (!isOpen) return null;

  const isValid = formData.name.trim() && formData.body.trim() && (formData.type !== 'email' || formData.subject.trim());
  const smsAnalysis = getSMSAnalysis();

  const modalContent = (
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40"
        onClick={onClose}
      />

      {/* Right-side Drawer */}
      <div
        className="fixed right-0 top-0 bottom-0 w-full sm:max-w-xl flex flex-col bg-white border-l border-neutral-200 shadow-2xl h-screen"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="relative px-4 sm:px-6 py-4 sm:py-5 pr-12 sm:pr-14 border-b border-neutral-100 bg-white flex-shrink-0 z-10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-[8px] bg-[#A57865]/10 flex items-center justify-center flex-shrink-0">
              <FileText className="w-[18px] h-[18px] text-[#A57865]" />
            </div>
            <div>
              <h2 className="text-[15px] font-semibold text-neutral-900">
                {mode === 'create' ? 'Create Template' : 'Edit Template'}
              </h2>
              <p className="text-[12px] text-neutral-400">
                {formData.type === 'email' ? 'Email template' : 'SMS template'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 rounded-[8px] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 sm:py-6 bg-white space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <label className="text-[11px] font-semibold text-neutral-400 uppercase tracking-widest mb-1.5 block">Template Name *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., Welcome Email"
                className="w-full px-3 py-2.5 bg-white border border-neutral-200 rounded-[8px] text-[13px] text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#A57865]/20 focus:border-[#A57865] transition-colors"
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-neutral-400 uppercase tracking-widest mb-1.5 block">Type</label>
              <CustomDropdown
                options={TEMPLATE_TYPE_OPTIONS}
                value={formData.type}
                onChange={(value) => setFormData(prev => ({ ...prev, type: value }))}
                className="w-full"
              />
            </div>
          </div>

          {formData.type === 'email' && (
            <div>
              <div className="flex items-center justify-between mb-1.5 sm:mb-2">
                <label className="text-[11px] font-semibold text-neutral-400 uppercase tracking-widest">Subject Line *</label>
                <button
                  onClick={handleGenerateSubjectLine}
                  disabled={isAIProcessing || !formData.body.trim()}
                  className="flex items-center gap-1 sm:gap-1.5 text-[10px] sm:text-xs text-[#5C9BA4] hover:text-[#5C9BA4]/80 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isAIProcessing ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : (
                    <Wand2 className="w-3 h-3" />
                  )}
                  <span className="hidden sm:inline">Generate Subject Line</span>
                  <span className="sm:hidden">Generate</span>
                </button>
              </div>
              <input
                type="text"
                value={formData.subject}
                onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                placeholder="e.g., Welcome to Glimmora, {{guest.firstName}}!"
                className="w-full px-3 py-2.5 bg-white border border-neutral-200 rounded-[8px] text-[13px] text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#A57865]/20 focus:border-[#A57865] transition-colors"
              />

              {/* Subject Suggestions */}
              {showSubjectSuggestions && subjectSuggestions.length > 0 && (
                <div className="mt-2 p-2 sm:p-3 bg-[#5C9BA4]/5 border border-[#5C9BA4]/20 rounded-[8px] animate-in slide-in-from-top-2 duration-200">
                  <p className="text-[10px] sm:text-xs text-neutral-600 mb-1.5 sm:mb-2 flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-[#5C9BA4]" />
                    AI Suggestions (click to use):
                  </p>
                  <div className="space-y-1 sm:space-y-1.5">
                    {subjectSuggestions.map((suggestion, idx) => (
                      <button
                        key={idx}
                        onClick={() => selectSubjectSuggestion(suggestion)}
                        className="w-full text-left px-2 sm:px-3 py-1.5 sm:py-2 text-[12px] bg-white border border-neutral-200 rounded-[6px] hover:bg-[#5C9BA4]/10 hover:border-[#5C9BA4] transition-colors"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          <div>
            <div className="flex items-center justify-between mb-1.5 sm:mb-2">
              <label className="text-[11px] font-semibold text-neutral-400 uppercase tracking-widest">Message Body *</label>
              <div className="flex items-center gap-1.5 sm:gap-2">
                {/* AI Assist Button */}
                <div className="relative">
                  <button
                    onClick={() => setShowAIAssist(!showAIAssist)}
                    disabled={isAIProcessing || !formData.body.trim()}
                    className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-1 bg-[#5C9BA4] text-white text-[10px] sm:text-[11px] rounded-[6px] hover:bg-[#5C9BA4]/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {isAIProcessing ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                      <Sparkles className="w-3 h-3" />
                    )}
                    <span className="hidden sm:inline">AI Assist</span>
                    <span className="sm:hidden">AI</span>
                  </button>

                  {/* AI Assist Dropdown */}
                  {showAIAssist && (
                    <div className="absolute right-0 top-full mt-1 w-40 sm:w-48 bg-white border border-neutral-200 rounded-[8px] shadow-lg z-10 py-1 animate-in slide-in-from-top-2 duration-200">
                      {AI_ASSIST_OPTIONS.map(({ value, label, icon: Icon }) => (
                        <button
                          key={value}
                          onClick={() => handleAIAssist(value)}
                          className="w-full flex items-center gap-2 px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-neutral-700 hover:bg-[#5C9BA4]/10 transition-colors"
                        >
                          <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#5C9BA4]" />
                          {label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <button
                  onClick={() => setShowTagsHelp(!showTagsHelp)}
                  className="flex items-center gap-1 text-[10px] sm:text-xs text-[#5C9BA4] hover:text-[#5C9BA4]/80"
                >
                  <Info className="w-3 h-3" />
                  <span className="hidden sm:inline">Personalization Tags</span>
                  <span className="sm:hidden">Tags</span>
                </button>
              </div>
            </div>

            {showTagsHelp && (
              <div className="mb-2 p-2 sm:p-3 bg-[#5C9BA4]/5 border border-[#5C9BA4]/20 rounded-[8px]">
                <p className="text-[10px] sm:text-xs text-neutral-600 mb-1.5 sm:mb-2">Click to insert:</p>
                <div className="flex flex-wrap gap-1">
                  {PERSONALIZATION_TAGS.map(({ tag, description }) => (
                    <button
                      key={tag}
                      onClick={() => insertTag(tag)}
                      title={description}
                      className="px-1.5 sm:px-2 py-0.5 sm:py-1 text-[10px] sm:text-[11px] bg-white border border-neutral-200 rounded-[6px] hover:bg-[#5C9BA4]/10 hover:border-[#5C9BA4] transition-colors"
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <textarea
              value={formData.body}
              onChange={(e) => setFormData(prev => ({ ...prev, body: e.target.value }))}
              placeholder="Write your message here..."
              rows={formData.type === 'email' ? 8 : 4}
              className="w-full px-3 py-2.5 bg-white border border-neutral-200 rounded-[8px] text-[13px] text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#A57865]/20 focus:border-[#A57865] resize-none font-mono transition-colors"
            />

            {/* SMS Character Count with AI Suggestions */}
            {formData.type === 'sms' && (
              <div className="mt-2 p-2 sm:p-3 bg-neutral-50 rounded-[8px] border border-neutral-100">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <span className={`text-xs sm:text-sm font-medium ${
                      smsAnalysis.status === 'optimal' ? 'text-emerald-600' :
                      smsAnalysis.status === 'caution' ? 'text-amber-600' :
                      smsAnalysis.status === 'warning' ? 'text-rose-600' :
                      'text-[#5C9BA4]'
                    }`}>
                      {smsAnalysis.charCount}/160
                    </span>
                    <span className="text-[10px] sm:text-xs text-neutral-500">{smsAnalysis.message}</span>
                  </div>
                  {smsAnalysis.status === 'warning' && (
                    <button
                      onClick={() => handleAIAssist('make-shorter')}
                      disabled={isAIProcessing}
                      className="flex items-center gap-1 text-[10px] sm:text-xs text-[#5C9BA4] hover:text-[#5C9BA4]/80"
                    >
                      <Wand2 className="w-3 h-3" />
                      <span className="hidden sm:inline">Shorten with AI</span>
                      <span className="sm:hidden">Shorten</span>
                    </button>
                  )}
                </div>
                {smsAnalysis.segments > 1 && (
                  <div className="mt-2 pt-2 border-t border-neutral-200">
                    <div className="flex items-center gap-1 sm:gap-1.5 text-[10px] sm:text-xs text-amber-600">
                      <AlertCircle className="w-3 h-3 sm:w-3.5 sm:h-3.5 flex-shrink-0" />
                      <span>This message will be sent as {smsAnalysis.segments} SMS segments, which may increase costs.</span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex-shrink-0 border-t border-neutral-100 px-4 sm:px-6 py-4 bg-white">
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-3 sm:px-4 py-2.5 border border-neutral-200 text-neutral-700 rounded-[8px] text-[13px] font-medium hover:bg-neutral-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={!isValid}
              className={`flex-1 px-3 sm:px-4 py-2.5 rounded-[8px] text-[13px] font-semibold transition-colors ${
                isValid
                  ? 'bg-[#A57865] text-white hover:bg-[#8E6554]'
                  : 'bg-neutral-200 text-neutral-400 cursor-not-allowed'
              }`}
            >
              {mode === 'create' ? 'Create Template' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}

export default function TemplateCenter({ templates, onSave, onDelete }) {
  const [modalState, setModalState] = useState({ isOpen: false, template: null, mode: 'create' });
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [filter, setFilter] = useState('all');
  const [copiedId, setCopiedId] = useState(null);
  const [expandedInsights, setExpandedInsights] = useState({});
  const [isGenerating, setIsGenerating] = useState(false);
  const [abTestModal, setABTestModal] = useState({ isOpen: false, template: null });

  const filteredTemplates = templates.filter(t => filter === 'all' || t.type === filter);

  const handleCreateTemplate = () => {
    setModalState({ isOpen: true, template: null, mode: 'create' });
  };

  const handleEditTemplate = (template) => {
    setModalState({ isOpen: true, template, mode: 'edit' });
  };

  const handleSaveTemplate = (templateData) => {
    if (modalState.mode === 'create') {
      onSave([...templates, templateData]);
    } else {
      onSave(templates.map(t => t.id === templateData.id ? templateData : t));
    }
  };

  const handleDeleteTemplate = (templateId) => {
    onDelete(templateId);
    setDeleteConfirm(null);
  };

  const handleCopyBody = (template) => {
    navigator.clipboard.writeText(template.body);
    setCopiedId(template.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const toggleInsights = (templateId) => {
    setExpandedInsights(prev => ({
      ...prev,
      [templateId]: !prev[templateId]
    }));
  };

  const handleAIGenerate = async (templateData) => {
    setIsGenerating(true);
    // Simulate saving delay
    await new Promise(resolve => setTimeout(resolve, 500));
    onSave([...templates, templateData]);
    setIsGenerating(false);
  };

  const handleCreateABTest = (originalTemplate, variants) => {
    // Save all variants as new templates
    const newTemplates = variants.map(v => ({
      ...v,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }));
    onSave([...templates, ...newTemplates]);
  };

  return (
    <div className="bg-white rounded-[10px] border border-neutral-200">
      {/* Header */}
      <div className="px-5 py-4 border-b border-neutral-100">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-[8px] bg-[#5C9BA4]/10 flex items-center justify-center flex-shrink-0">
              <FileText className="w-[18px] h-[18px] text-[#5C9BA4]" />
            </div>
            <div>
              <h3 className="text-[15px] font-semibold text-neutral-900">Template Center</h3>
              <p className="text-[12px] text-neutral-400 mt-0.5">{templates.length} templates</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <CustomDropdown
              options={[
                { value: 'all', label: 'All Types' },
                { value: 'email', label: 'Email' },
                { value: 'sms', label: 'SMS' }
              ]}
              value={filter}
              onChange={setFilter}
              className="[&_button]:min-w-[90px] sm:[&_button]:min-w-[110px]"
            />
            <button
              onClick={handleCreateTemplate}
              className="flex items-center gap-1.5 px-3 sm:px-4 py-2 bg-[#A57865] text-white rounded-[8px] text-[12px] sm:text-[13px] font-semibold hover:bg-[#8E6554] transition-colors whitespace-nowrap"
            >
              <Plus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Add Template</span>
              <span className="sm:hidden">Add</span>
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        {/* AI Template Generator Section */}
        <AITemplateGenerator onGenerate={handleAIGenerate} isGenerating={isGenerating} />
        {filteredTemplates.map((template) => (
          <div
            key={template.id}
            className="bg-neutral-50 border border-neutral-100 rounded-[8px] p-4 hover:border-neutral-200 transition-colors"
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-3">
                {template.type === 'email' ? (
                  <div className="w-9 h-9 rounded-[8px] bg-[#4E5840]/10 flex items-center justify-center">
                    <Mail className="w-[18px] h-[18px] text-[#4E5840]" />
                  </div>
                ) : (
                  <div className="w-9 h-9 rounded-[8px] bg-[#5C9BA4]/10 flex items-center justify-center">
                    <MessageSquare className="w-[18px] h-[18px] text-[#5C9BA4]" />
                  </div>
                )}
                <div>
                  <h4 className="text-[13px] font-semibold text-neutral-900">{template.name}</h4>
                  <div className="flex items-center gap-2 text-[11px] text-neutral-500">
                    <span className={`px-2 py-0.5 rounded-full ${
                      template.type === 'email'
                        ? 'bg-[#4E5840]/10 text-[#4E5840]'
                        : 'bg-[#5C9BA4]/10 text-[#5C9BA4]'
                    }`}>
                      {template.type.toUpperCase()}
                    </span>
                    <span>Updated {formatDate(template.updatedAt)}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1">
                {/* A/B Test Button */}
                <button
                  onClick={() => setABTestModal({ isOpen: true, template })}
                  className="p-1.5 hover:bg-[#CDB261]/10 rounded-[6px] transition-colors"
                  title="Create A/B Test"
                >
                  <TestTube2 className="w-4 h-4 text-[#CDB261]" />
                </button>
                <button
                  onClick={() => handleCopyBody(template)}
                  className="p-1.5 hover:bg-neutral-100 rounded-[6px] transition-colors"
                  title="Copy body"
                >
                  {copiedId === template.id ? (
                    <Check className="w-4 h-4 text-[#4E5840]" />
                  ) : (
                    <Copy className="w-4 h-4 text-neutral-500" />
                  )}
                </button>
                <button
                  onClick={() => handleEditTemplate(template)}
                  className="p-1.5 hover:bg-neutral-100 rounded-[6px] transition-colors"
                >
                  <Edit2 className="w-4 h-4 text-neutral-500" />
                </button>
                <button
                  onClick={() => setDeleteConfirm(template.id)}
                  className="p-1.5 hover:bg-rose-50 rounded-[6px] transition-colors"
                >
                  <Trash2 className="w-4 h-4 text-rose-500" />
                </button>
              </div>
            </div>

            {template.subject && (
              <p className="text-[12px] font-medium text-neutral-700 mb-1">
                Subject: {template.subject}
              </p>
            )}

            <p className="text-[12px] text-neutral-500 line-clamp-2">
              {template.body}
            </p>

            {/* AI Performance Insights */}
            <AIInsightsPanel
              template={template}
              expanded={expandedInsights[template.id]}
              onToggle={() => toggleInsights(template.id)}
            />

            {deleteConfirm === template.id && (
              <div className="mt-3 pt-3 border-t border-neutral-100 bg-rose-50 -mx-4 -mb-4 p-4 rounded-b-[8px]">
                <p className="text-[12px] text-rose-800 mb-2">Delete this template?</p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleDeleteTemplate(template.id)}
                    className="px-3 py-1.5 bg-rose-600 text-white text-[11px] font-semibold rounded-[6px] hover:bg-rose-700 transition-colors"
                  >
                    Delete
                  </button>
                  <button
                    onClick={() => setDeleteConfirm(null)}
                    className="px-3 py-1.5 text-[11px] font-medium text-neutral-700 hover:bg-neutral-200 rounded-[6px] transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}

        {filteredTemplates.length === 0 && (
          <div className="text-center py-8">
            <div className="w-10 h-10 rounded-[8px] bg-neutral-100 flex items-center justify-center mx-auto mb-3">
              <FileText className="w-5 h-5 text-neutral-300" />
            </div>
            <p className="text-[13px] font-medium text-neutral-600">No templates found</p>
            <p className="text-[11px] text-neutral-400 mt-1">Create your first template to get started</p>
            <button
              onClick={handleCreateTemplate}
              className="mt-3 inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#A57865] text-white rounded-[8px] text-[12px] font-semibold hover:bg-[#8E6554] transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              Create Template
            </button>
          </div>
        )}
      </div>

      <TemplateModal
        isOpen={modalState.isOpen}
        onClose={() => setModalState({ isOpen: false, template: null, mode: 'create' })}
        onSave={handleSaveTemplate}
        template={modalState.template}
        mode={modalState.mode}
      />

      <ABTestModal
        isOpen={abTestModal.isOpen}
        onClose={() => setABTestModal({ isOpen: false, template: null })}
        template={abTestModal.template}
        onCreateTest={handleCreateABTest}
      />
    </div>
  );
}
