import {
  TrendingUp,
  Users,
  MessageSquare,
  Sparkles,
  Wrench,
  ArrowRight,
  Brain
} from 'lucide-react';

const iconMap = {
  'trending-up': TrendingUp,
  users: Users,
  'message-square': MessageSquare,
  sparkles: Sparkles,
  wrench: Wrench,
};

const colorMap = {
  aurora: 'bg-[#5C9BA4]',
  midnight: 'bg-[#4E5840]',
  sunset: 'bg-[#CDB261]',
  neutral: 'bg-neutral-500',
};

const AiInsights = ({ insights }) => {
  return (
    <div className="bg-[#5C9BA4] rounded-xl p-8 shadow-lg relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-64 h-64 bg-white rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl"></div>
      </div>

      {/* Content */}
      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2.5 bg-white/20 backdrop-blur-sm rounded-xl">
            <Brain className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-sans font-bold text-white">
              AI Intelligence Center
            </h2>
            <p className="text-white/80 text-sm">
              Predictive insights powered by Glimmora AGI
            </p>
          </div>
        </div>

        {/* Insights Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {insights.slice(0, 3).map((insight) => {
            const Icon = iconMap[insight.icon] || Sparkles;
            const ColorClass = colorMap[insight.color] || colorMap.aurora;

            return (
              <div
                key={insight.id}
                className="bg-white/95 backdrop-blur-sm rounded-xl p-5 hover:bg-white transition-all group cursor-pointer"
              >
                <div className="flex items-start gap-3 mb-3">
                  <div className={`p-2 ${ColorClass} rounded-lg flex-shrink-0`}>
                    <Icon className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-neutral-900 text-sm mb-1">
                      {insight.title}
                    </h3>
                    <p className="text-xs text-neutral-600 line-clamp-2">
                      {insight.message}
                    </p>
                  </div>
                </div>

                <button className="w-full mt-3 flex items-center justify-between px-3 py-2 bg-[#FAF8F6] hover:bg-neutral-100 rounded-lg transition-all group-hover:bg-neutral-100">
                  <span className="text-xs font-medium text-neutral-700">
                    {insight.action}
                  </span>
                  <ArrowRight className="w-4 h-4 text-neutral-400 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            );
          })}
        </div>

        {/* View All Link */}
        <div className="mt-6 text-center">
          <button className="text-white text-sm font-medium hover:text-white/80 transition-colors inline-flex items-center gap-2">
            View all {insights.length} AI insights
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AiInsights;
