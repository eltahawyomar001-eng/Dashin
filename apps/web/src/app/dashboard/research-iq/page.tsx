'use client';

import { useState } from 'react';
import { Card, CardContent, Button, Badge } from '@dashin/ui';
import { TrendingUp, Brain, Target, Users, ChevronRight, Sparkles, BarChart3, Clock } from 'lucide-react';
import { Can } from '@dashin/rbac';

interface InsightCard {
  id: string;
  title: string;
  description: string;
  confidence: number;
  category: 'market' | 'competitor' | 'audience' | 'trend';
  actionable: boolean;
  createdAt: string;
}

const MOCK_INSIGHTS: InsightCard[] = [
  {
    id: '1',
    title: 'Healthcare Tech Market Expansion',
    description: 'Series A healthcare technology companies show 43% increase in hiring activity, indicating market growth opportunity.',
    confidence: 94,
    category: 'market',
    actionable: true,
    createdAt: '2024-02-04T08:00:00Z',
  },
  {
    id: '2',
    title: 'Competitor Analysis: CloudSync',
    description: 'CloudSync targeting similar ICP with lower pricing. Recommend emphasizing premium support and enterprise features.',
    confidence: 87,
    category: 'competitor',
    actionable: true,
    createdAt: '2024-02-03T14:30:00Z',
  },
  {
    id: '3',
    title: 'Lead Quality Improvement',
    description: 'Leads from LinkedIn Sales Navigator show 2.3x higher conversion rate than other sources.',
    confidence: 92,
    category: 'audience',
    actionable: true,
    createdAt: '2024-02-03T10:15:00Z',
  },
  {
    id: '4',
    title: 'AI Adoption Trending',
    description: 'Target accounts mentioning "AI integration" in job postings up 76% QoQ. Consider AI-focused messaging.',
    confidence: 89,
    category: 'trend',
    actionable: true,
    createdAt: '2024-02-02T16:45:00Z',
  },
];

export default function ResearchIQPage() {
  const [selectedCategory, setSelectedCategory] = useState<InsightCard['category'] | 'all'>('all');

  const filteredInsights = selectedCategory === 'all' 
    ? MOCK_INSIGHTS 
    : MOCK_INSIGHTS.filter(i => i.category === selectedCategory);

  const getCategoryIcon = (category: InsightCard['category']) => {
    switch (category) {
      case 'market':
        return <BarChart3 className="h-4 w-4" />;
      case 'competitor':
        return <Target className="h-4 w-4" />;
      case 'audience':
        return <Users className="h-4 w-4" />;
      case 'trend':
        return <TrendingUp className="h-4 w-4" />;
    }
  };

  const getCategoryColor = (category: InsightCard['category']) => {
    switch (category) {
      case 'market':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'competitor':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'audience':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'trend':
        return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 90) return 'text-green-400';
    if (confidence >= 75) return 'text-blue-400';
    return 'text-yellow-400';
  };

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-3">
            <Brain className="h-6 w-6 md:h-8 md:w-8 text-primary-400" />
            Research IQ
          </h1>
          <p className="text-slate-400 mt-1 text-sm md:text-base">AI-powered insights and market intelligence</p>
        </div>
        <Can permission="research_iq:view_own">
          <Button className="gap-2">
            <Sparkles className="h-4 w-4" />
            Generate New Insights
          </Button>
        </Can>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card variant="glass">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Total Insights</p>
                <p className="text-3xl font-bold text-white mt-1">{MOCK_INSIGHTS.length}</p>
              </div>
              <div className="h-12 w-12 rounded-lg bg-primary-500/20 flex items-center justify-center">
                <Brain className="h-6 w-6 text-primary-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card variant="glass">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Actionable</p>
                <p className="text-3xl font-bold text-white mt-1">
                  {MOCK_INSIGHTS.filter(i => i.actionable).length}
                </p>
              </div>
              <div className="h-12 w-12 rounded-lg bg-green-500/20 flex items-center justify-center">
                <Target className="h-6 w-6 text-green-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card variant="glass">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Avg Confidence</p>
                <p className="text-3xl font-bold text-white mt-1">
                  {Math.round(MOCK_INSIGHTS.reduce((sum, i) => sum + i.confidence, 0) / MOCK_INSIGHTS.length)}%
                </p>
              </div>
              <div className="h-12 w-12 rounded-lg bg-blue-500/20 flex items-center justify-center">
                <Sparkles className="h-6 w-6 text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card variant="glass">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Last Updated</p>
                <p className="text-xl font-bold text-white mt-1">2 hours ago</p>
              </div>
              <div className="h-12 w-12 rounded-lg bg-accent-500/20 flex items-center justify-center">
                <Clock className="h-6 w-6 text-accent-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Category Filters */}
      <Card variant="glass">
        <CardContent className="p-4 md:p-6">
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant={selectedCategory === 'all' ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => setSelectedCategory('all')}
            >
              All Insights
            </Button>
            <Button
              variant={selectedCategory === 'market' ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => setSelectedCategory('market')}
              className="gap-2"
            >
              <BarChart3 className="h-4 w-4" />
              Market
            </Button>
            <Button
              variant={selectedCategory === 'competitor' ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => setSelectedCategory('competitor')}
              className="gap-2"
            >
              <Target className="h-4 w-4" />
              Competitor
            </Button>
            <Button
              variant={selectedCategory === 'audience' ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => setSelectedCategory('audience')}
              className="gap-2"
            >
              <Users className="h-4 w-4" />
              Audience
            </Button>
            <Button
              variant={selectedCategory === 'trend' ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => setSelectedCategory('trend')}
              className="gap-2"
            >
              <TrendingUp className="h-4 w-4" />
              Trends
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Insights List */}
      <div className="space-y-4">
        {filteredInsights.map((insight) => (
          <Card key={insight.id} variant="glass">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`h-10 w-10 rounded-lg border flex items-center justify-center ${getCategoryColor(insight.category)}`}>
                      {getCategoryIcon(insight.category)}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-white">{insight.title}</h3>
                      <div className="flex items-center gap-3 mt-1">
                        <Badge variant="info" className="capitalize">
                          {insight.category}
                        </Badge>
                        {insight.actionable && (
                          <Badge variant="success">
                            Actionable
                          </Badge>
                        )}
                        <span className={`text-sm font-medium ${getConfidenceColor(insight.confidence)}`}>
                          {insight.confidence}% confidence
                        </span>
                      </div>
                    </div>
                  </div>

                  <p className="text-slate-300 leading-relaxed mb-4">
                    {insight.description}
                  </p>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-400">
                      Generated {new Date(insight.createdAt).toLocaleDateString()}
                    </span>
                    <Can permission="research_iq:view_own">
                      <Button variant="ghost" size="sm" className="gap-2">
                        View Details
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </Can>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredInsights.length === 0 && (
        <Card variant="glass">
          <CardContent className="p-12 text-center">
            <Brain className="h-12 w-12 text-slate-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">No insights found</h3>
            <p className="text-slate-400 mb-6">
              Try selecting a different category or generate new insights
            </p>
            <Can permission="research_iq:view_own">
              <Button>
                <Sparkles className="h-4 w-4 mr-2" />
                Generate Insights
              </Button>
            </Can>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
