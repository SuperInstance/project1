'use client'

/**
 * Quick Access Cards for Cognitive AI Features
 * Highlights cognitive AI capabilities on home page
 */

import { Brain, Settings, FolderOpen, TrendingUp, ArrowRight } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

export function CognitiveQuickAccess() {
  const handleClick = (action: string) => {
    console.log('[Cognitive Quick Access] Clicked:', action)
    // Would navigate to cognitive page
    window.location.href = '/cognitive'
  }

  return (
    <div className="space-y-3 mb-6">
      <div className="flex items-center gap-2 mb-2">
        <Brain className="h-4 w-4 text-primary animate-pulse" />
        <h3 className="text-sm font-semibold">Cognitive AI Features</h3>
        <Badge variant="outline" className="text-xs bg-primary/10">
          NEW
        </Badge>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Cognitive AI Dashboard Card */}
        <Card 
          className="hover:shadow-lg transition-all cursor-pointer border-primary/20 group"
          onClick={() => handleClick('dashboard')}
        >
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="bg-primary/10 p-2 rounded-lg group-hover:bg-primary/20">
                <Brain className="h-5 w-5 text-primary" />
              </div>
              <Badge variant="outline" className="text-xs bg-primary/10">
                Active
              </Badge>
            </div>
            <CardTitle className="text-base">Cognitive AI Dashboard</CardTitle>
            <CardDescription className="text-xs">
              See system intelligence and your personalized profile
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs">
                <Settings className="h-3 w-3 text-muted-foreground" />
                <span className="text-muted-foreground">7 cognitive systems working together</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <TrendingUp className="h-3 w-3 text-green-500" />
                <span className="text-muted-foreground">System Intelligence: 87/100</span>
              </div>
            </div>
            <Button variant="outline" className="w-full mt-3 group-hover:bg-primary/10">
              View Dashboard
              <ArrowRight className="h-3 w-3 ml-2" />
            </Button>
          </CardContent>
        </Card>

        {/* Your Preferences Card */}
        <Card 
          className="hover:shadow-lg transition-all cursor-pointer"
          onClick={() => handleClick('preferences')}
        >
          <CardHeader className="pb-3">
            <div className="bg-primary/10 p-2 rounded-lg">
              <Settings className="h-5 w-5 text-primary" />
            </div>
            <CardTitle className="text-base">Your Preferences</CardTitle>
            <CardDescription className="text-xs">
              See what system has learned about you
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Tone Preference</span>
                <span className="font-medium">Conversational</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Episode Length</span>
                <span className="font-medium">15 minutes</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Confidence</span>
                <span className="font-medium text-primary">89%</span>
              </div>
            </div>
            <Button variant="outline" className="w-full mt-3">
              View Preferences
              <ArrowRight className="h-3 w-3 ml-2" />
            </Button>
          </CardContent>
        </Card>

        {/* Project Intelligence Card */}
        <Card 
          className="hover:shadow-lg transition-all cursor-pointer"
          onClick={() => handleClick('project')}
        >
          <CardHeader className="pb-3">
            <div className="bg-primary/10 p-2 rounded-lg">
              <FolderOpen className="h-5 w-5 text-primary" />
            </div>
            <CardTitle className="text-base">Project Intelligence</CardTitle>
            <CardDescription className="text-xs">
              See how deeply system understands your content
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs">
                <TrendingUp className="h-3 w-3 text-primary" />
                <span className="text-muted-foreground">237 files analyzed</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <TrendingUp className="h-3 w-3 text-primary" />
                <span className="text-muted-foreground">127 themes extracted</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <TrendingUp className="h-3 w-3 text-primary" />
                <span className="text-muted-foreground">312 concepts connected</span>
              </div>
            </div>
            <Button variant="outline" className="w-full mt-3">
              Explore Intelligence
              <ArrowRight className="h-3 w-3 ml-2" />
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
