'use client'

import { useState, useEffect, useRef } from 'react'
import {
  ResizablePanel,
  ResizablePanelGroup,
  ResizableHandle,
} from '@/components/ui/resizable'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Slider } from '@/components/ui/slider'
import { Play, Pause, Mic, MicOff, Send, Upload, Link, FileText, Settings, Volume2, RefreshCw, Save, Sparkles, MessageSquare, Music } from 'lucide-react'
import { toast } from 'sonner'

interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

interface AudioSegment {
  id: string
  text: string
  audioUrl?: string
  voice: string
  speed: number
  volume: number
  isGenerating: boolean
}

export default function PodcastMaker() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Welcome to the Podcast Maker! I\'m your AI assistant for creating engaging educational podcast content.\n\n**Getting Started:**\n\n1. Tell me about your project or paste documentation URLs\n2. Upload files you want to turn into podcast episodes\n3. We\'ll work together on outlines, scripts, and presentation styles\n4. Generate audio locally or use premium TTS services\n\nWhat would you like to create a podcast about today?',
      timestamp: new Date()
    }
  ])
  const [input, setInput] = useState('')
  const [conversationMode, setConversationMode] = useState<'operational' | 'podcast'>('podcast')
  const [isRecording, setIsRecording] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentSegment, setCurrentSegment] = useState(0)
  const [script, setScript] = useState(`# Episode 1: Introduction

**Presenter 1** [enthusiastic tone]:
Welcome to today's episode where we explore [TOPIC]!

**Presenter 2** [thoughtful tone]:
That's right. In this series, we'll dive deep into...

**Presenter 1** [casual, laughing]:
You know what I love about this? It's that...

---

*Tip: Work with the AI assistant on the left to refine this script. Select text and give feedback, or ask for specific improvements.*`)
  const [audioSegments, setAudioSegments] = useState<AudioSegment[]>([])
  const [selectedText, setSelectedText] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const chatEndRef = useRef<HTMLDivElement>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const audioRef = useRef<HTMLAudioElement>(null)

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSendMessage = async () => {
    if (!input.trim()) return

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: selectedText ? `[Selected text: "${selectedText}"]\n\n${input}` : input,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setSelectedText('')
    setIsProcessing(true)

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMessage].map(m => ({
            role: m.role,
            content: m.content
          })),
          selectedText: selectedText || undefined,
          context: {
            scriptLength: script.length,
            segmentsCount: audioSegments.length
          }
        })
      })

      const data = await response.json()

      if (!data.success) {
        throw new Error(data.error || 'Failed to get response')
      }

      // Update conversation mode
      if (data.mode) {
        setConversationMode(data.mode)
      }

      // Auto-populate script editor if AI generated script content
      if (data.isScript && data.extractedScript) {
        setScript(data.extractedScript)
        toast.success('📝 Script auto-generated and populated in editor!')
      }

      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.response,
        timestamp: new Date()
      }

      setMessages(prev => [...prev, assistantMessage])
      setIsProcessing(false)
    } catch (error) {
      console.error('Chat error:', error)
      toast.error('Failed to get AI response. Please try again.')
      setIsProcessing(false)
    }
  }

  const handleStartRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' })
      mediaRecorderRef.current = mediaRecorder
      audioChunksRef.current = []

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      }

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' })
        const formData = new FormData()
        formData.append('audio', audioBlob, 'recording.webm')

        try {
          const response = await fetch('/api/asr', {
            method: 'POST',
            body: formData
          })

          const data = await response.json()

          if (!data.success) {
            throw new Error(data.error || 'Failed to transcribe')
          }

          setInput(prev => prev + (prev ? ' ' : '') + data.transcription)
          toast.success('Audio transcribed successfully!')
        } catch (error) {
          console.error('ASR error:', error)
          toast.error('Failed to transcribe audio. Please try again.')
        }
      }

      mediaRecorder.start()
      setIsRecording(true)
      toast.success('Recording started. Click again to stop.')
    } catch (error) {
      console.error('Recording error:', error)
      toast.error('Failed to access microphone. Please check permissions.')
    }
  }

  const handleStopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop())
      setIsRecording(false)
      setIsProcessing(true)
      toast.info('Processing audio...')
    }
  }

  const handleGenerateAudio = async (text: string, index: number) => {
    setAudioSegments(prev => {
      const newSegments = [...prev]
      if (!newSegments[index]) {
        newSegments[index] = {
          id: `seg-${index}`,
          text,
          audioUrl: undefined,
          voice: 'tongtong',
          speed: 1.0,
          volume: 1.0,
          isGenerating: true
        }
      } else {
        newSegments[index].isGenerating = true
      }
      return newSegments
    })

    try {
      const response = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: text.substring(0, 1024), // Limit to 1024 chars
          voice: 'tongtong',
          speed: 1.0,
          volume: 1.0,
          format: 'wav'
        })
      })

      const data = await response.json()

      if (!data.success) {
        throw new Error(data.error || 'Failed to generate audio')
      }

      setAudioSegments(prev => {
        const newSegments = [...prev]
        if (newSegments[index]) {
          newSegments[index].audioUrl = data.audioUrl
          newSegments[index].isGenerating = false
        }
        return newSegments
      })

      toast.success('Audio generated successfully!')
    } catch (error) {
      console.error('TTS error:', error)
      toast.error('Failed to generate audio. Please try again.')
      setAudioSegments(prev => {
        const newSegments = [...prev]
        if (newSegments[index]) {
          newSegments[index].isGenerating = false
        }
        return newSegments
      })
    }
  }

  const handlePlaySegment = async (index: number) => {
    const segment = audioSegments[index]
    if (!segment?.audioUrl) {
      await handleGenerateAudio(segment.text || '', index)
      return
    }

    setCurrentSegment(index)
    setIsPlaying(true)

    if (audioRef.current) {
      audioRef.current.src = segment.audioUrl!
      audioRef.current.play()

      audioRef.current.onended = () => {
        setIsPlaying(false)
        if (index < audioSegments.length - 1 && audioSegments[index + 1]?.audioUrl) {
          handlePlaySegment(index + 1)
        }
      }
    }
  }

  const handleStopPlayback = () => {
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
    }
    setIsPlaying(false)
  }

  const handleFileUpload = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.multiple = true
    input.accept = '*/*'
    input.onchange = async (e) => {
      const files = (e.target as HTMLInputElement).files
      if (files && files.length > 0) {
        toast.info(`Analyzing ${files.length} file(s)... In production, this would extract and process content.`)

        // Simulate AI analyzing uploaded files
        const fileNames = Array.from(files).map(f => f.name).join(', ')
        setMessages(prev => [...prev, {
          id: Date.now().toString(),
          role: 'assistant',
          content: `I've received ${files.length} file(s): ${fileNames}\n\nI'll analyze these materials and suggest a podcast structure. Would you like me to:\n\n1. Create an outline based on these documents\n2. Suggest episode topics\n3. Identify key themes and narratives\n\nWhat would you prefer?`,
          timestamp: new Date()
        }])
      }
    }
    input.click()
  }

  const handleUrlSubmit = () => {
    const url = prompt('Enter the URL you want to create a podcast about:')
    if (url) {
      toast.info(`Analyzing content from: ${url}`)

      // Simulate AI analyzing URL
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'assistant',
        content: `I'll analyze the content from ${url} and help you create an engaging podcast about it.\n\nWould you like me to:\n\n1. Summarize the main points\n2. Create an outline for a multi-episode series\n3. Identify interesting angles and discussion topics\n\nWhat's your goal for this podcast?`,
        timestamp: new Date()
      }])
    }
  }

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Hidden audio element for playback */}
      <audio ref={audioRef} />

      {/* Header */}
      <header className="border-b bg-card px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Music className="h-6 w-6 text-primary" />
          <div>
            <h1 className="text-lg font-bold">Podcast Maker</h1>
            <p className="text-xs text-muted-foreground">AI-powered podcast creation suite</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleFileUpload}>
            <Upload className="h-4 w-4 mr-2" />
            Upload Files
          </Button>
          <Button variant="outline" size="sm" onClick={handleUrlSubmit}>
            <Link className="h-4 w-4 mr-2" />
            Add URL
          </Button>
          <Separator orientation="vertical" className="h-6 mx-2" />
          <Button variant="ghost" size="sm">
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </header>

      {/* Main Content - Three Panel Layout */}
      <div className="flex-1 overflow-hidden">
        <ResizablePanelGroup direction="horizontal" className="h-full">
          {/* Left Panel - Chatbot */}
          <ResizablePanel defaultSize={25} minSize={20} maxSize={40}>
            <div className="h-full flex flex-col border-r">
              <div className="p-4 border-b bg-card">
                <div className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-primary" />
                  <h2 className="font-semibold">AI Assistant</h2>
                  <Badge variant={conversationMode === 'operational' ? 'outline' : 'default'} className="ml-auto">
                    {conversationMode === 'operational' ? '💡 Help Mode' : '🎙️ Podcast Mode'}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-1">Collaborate to craft your podcast</p>
              </div>

              <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      {message.role === 'assistant' && (
                        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                          <Sparkles className="h-4 w-4 text-primary-foreground" />
                        </div>
                      )}
                      <div
                        className={`max-w-[80%] rounded-lg p-3 ${
                          message.role === 'user'
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted'
                        }`}
                      >
                        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                        <p className="text-xs opacity-70 mt-2">
                          {message.timestamp.toLocaleTimeString()}
                        </p>
                      </div>
                      {message.role === 'user' && (
                        <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
                          <span className="text-xs font-semibold">You</span>
                        </div>
                      )}
                    </div>
                  ))}
                  {isProcessing && (
                    <div className="flex gap-3 justify-start">
                      <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                        <Sparkles className="h-4 w-4 text-primary-foreground" />
                      </div>
                      <div className="bg-muted rounded-lg p-3">
                        <div className="flex gap-1">
                          <div className="w-2 h-2 bg-primary rounded-full animate-bounce" />
                          <div className="w-2 h-2 bg-primary rounded-full animate-bounce delay-100" />
                          <div className="w-2 h-2 bg-primary rounded-full animate-bounce delay-200" />
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={chatEndRef} />
                </div>
              </ScrollArea>

              <div className="p-4 border-t bg-card space-y-3">
                {selectedText && (
                  <div className="bg-muted/50 rounded-lg p-2 text-xs">
                    <span className="font-medium">Selected: </span>
                    "{selectedText.substring(0, 50)}{selectedText.length > 50 ? '...' : ''}"
                  </div>
                )}
                <div className="flex gap-2">
                  <Button
                    variant={isRecording ? "destructive" : "outline"}
                    size="icon"
                    onClick={isRecording ? handleStopRecording : handleStartRecording}
                    disabled={isProcessing}
                  >
                    {isRecording ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                  </Button>
                  <Input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder="Type your message or use voice input..."
                    disabled={isProcessing || isRecording}
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={!input.trim() || isProcessing || isRecording}
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </ResizablePanel>

          <ResizableHandle className="w-1 bg-border hover:bg-primary/50 transition-colors" />

          {/* Center Panel - Markdown Editor */}
          <ResizablePanel defaultSize={50} minSize={30}>
            <div className="h-full flex flex-col">
              <div className="p-4 border-b bg-card flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  <h2 className="font-semibold">Script Editor</h2>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" onClick={() => setScript(script)}>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Reset
                  </Button>
                  <Button variant="default" size="sm" onClick={() => toast.success('Script saved!')}>
                    <Save className="h-4 w-4 mr-2" />
                    Save
                  </Button>
                </div>
              </div>

              <div className="flex-1 overflow-auto">
                <textarea
                  value={script}
                  onChange={(e) => {
                    setScript(e.target.value)
                    const selectionStart = e.target.selectionStart
                    const selectionEnd = e.target.selectionEnd
                    if (selectionStart !== selectionEnd) {
                      setSelectedText(e.target.value.substring(selectionStart, selectionEnd))
                    }
                  }}
                  onMouseUp={(e) => {
                    const target = e.target as HTMLTextAreaElement
                    const start = target.selectionStart
                    const end = target.selectionEnd
                    if (start !== end) {
                      setSelectedText(target.value.substring(start, end))
                    } else {
                      setSelectedText('')
                    }
                  }}
                  className="w-full h-full p-6 resize-none bg-background font-mono text-sm leading-relaxed focus:outline-none"
                  placeholder="Start writing your podcast script here..."
                  spellCheck={false}
                />
              </div>
            </div>
          </ResizablePanel>

          <ResizableHandle className="w-1 bg-border hover:bg-primary/50 transition-colors" />

          {/* Right Panel - Audio Controls */}
          <ResizablePanel defaultSize={25} minSize={20} maxSize={40}>
            <div className="h-full flex flex-col border-l">
              <Tabs defaultValue="segments" className="flex flex-col h-full">
                <div className="p-4 border-b bg-card">
                  <TabsList className="w-full">
                    <TabsTrigger value="segments" className="flex-1">Segments</TabsTrigger>
                    <TabsTrigger value="voices" className="flex-1">Voices</TabsTrigger>
                    <TabsTrigger value="export" className="flex-1">Export</TabsTrigger>
                  </TabsList>
                </div>

                <ScrollArea className="flex-1 p-4">
                  <TabsContent value="segments" className="space-y-3 mt-0">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">Audio Segments</CardTitle>
                        <CardDescription className="text-xs">
                          Generate and manage podcast audio
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="space-y-2">
                          {script.split('\n\n').slice(0, 5).map((segment, i) => (
                            <div
                              key={i}
                              className={`p-3 rounded-lg border transition-colors cursor-pointer ${
                                currentSegment === i ? 'bg-primary/10 border-primary' : 'hover:bg-muted/50'
                              }`}
                              onClick={() => handlePlaySegment(i)}
                            >
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-xs font-medium">Segment {i + 1}</span>
                                <div className="flex items-center gap-2">
                                  {audioSegments[i]?.isGenerating && (
                                    <RefreshCw className="h-3 w-3 animate-spin text-primary" />
                                  )}
                                  {audioSegments[i]?.audioUrl && (
                                    <span className="text-xs text-green-500">✓</span>
                                  )}
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-6 w-6"
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      if (isPlaying && currentSegment === i) {
                                        handleStopPlayback()
                                      } else {
                                        handlePlaySegment(i)
                                      }
                                    }}
                                  >
                                    {isPlaying && currentSegment === i ? (
                                      <Pause className="h-3 w-3" />
                                    ) : (
                                      <Play className="h-3 w-3" />
                                    )}
                                  </Button>
                                </div>
                              </div>
                              <p className="text-xs text-muted-foreground line-clamp-2">
                                {segment.substring(0, 100) || 'Empty segment...'}
                              </p>
                            </div>
                          ))}
                        </div>
                        <Separator />
                        <Button
                          variant="default"
                          size="sm"
                          className="w-full"
                          onClick={() => {
                            const segments = script.split('\n\n')
                            segments.forEach((seg, i) => handleGenerateAudio(seg, i))
                          }}
                          disabled={isProcessing}
                        >
                          {isProcessing ? (
                            <>
                              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                              Generating All...
                            </>
                          ) : (
                            <>
                              <Sparkles className="h-4 w-4 mr-2" />
                              Generate All Audio
                            </>
                          )}
                        </Button>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="voices" className="space-y-3 mt-0">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">Voice Settings</CardTitle>
                        <CardDescription className="text-xs">
                          Configure presenter voices
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <label className="text-sm font-medium mb-2 block">Presenter 1</label>
                          <select
                            className="w-full p-2 rounded-md border bg-background text-sm"
                            onChange={(e) => {
                              setAudioSegments(prev => {
                                const newSegments = [...prev]
                                newSegments[0] = { ...newSegments[0], voice: e.target.value }
                                return newSegments
                              })
                            }}
                          >
                            <option value="tongtong">Tongtong (Default)</option>
                            <option value="chuichui">Chuichui</option>
                            <option value="xiaochen">Xiaochen</option>
                            <option value="jam">Jam</option>
                            <option value="kazi">Kazi</option>
                            <option value="douji">Douji</option>
                            <option value="luodo">Luodo</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-sm font-medium mb-2 block">Presenter 2</label>
                          <select
                            className="w-full p-2 rounded-md border bg-background text-sm"
                            onChange={(e) => {
                              setAudioSegments(prev => {
                                const newSegments = [...prev]
                                newSegments[1] = { ...newSegments[1], voice: e.target.value }
                                return newSegments
                              })
                            }}
                          >
                            <option value="xiaochen">Xiaochen (Default)</option>
                            <option value="tongtong">Tongtong</option>
                            <option value="chuichui">Chuichui</option>
                            <option value="jam">Jam</option>
                            <option value="kazi">Kazi</option>
                            <option value="douji">Douji</option>
                            <option value="luodo">Luodo</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-sm font-medium mb-2 block">Speech Speed: {1.0}x</label>
                          <div className="flex items-center gap-3">
                            <span className="text-xs text-muted-foreground">0.5x</span>
                            <Slider
                              defaultValue={[1.0]}
                              min={0.5}
                              max={2.0}
                              step={0.1}
                              className="flex-1"
                              onValueChange={(value) => {
                                const speed = value[0]
                                document.querySelector('label')!.textContent = `Speech Speed: ${speed.toFixed(1)}x`
                              }}
                            />
                            <span className="text-xs text-muted-foreground">2.0x</span>
                          </div>
                        </div>
                        <div>
                          <label className="text-sm font-medium mb-2 block">Volume: {1.0}x</label>
                          <div className="flex items-center gap-3">
                            <Volume2 className="h-4 w-4 text-muted-foreground" />
                            <Slider
                              defaultValue={[1.0]}
                              min={0.1}
                              max={10.0}
                              step={0.1}
                              className="flex-1"
                              onValueChange={(value) => {
                                const volume = value[0]
                                document.querySelectorAll('label')[3]!.textContent = `Volume: ${volume.toFixed(1)}x`
                              }}
                            />
                            <span className="text-xs text-muted-foreground">10x</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="export" className="space-y-3 mt-0">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">Export Podcast</CardTitle>
                        <CardDescription className="text-xs">
                          Export your final podcast
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div>
                          <label className="text-sm font-medium mb-2 block">Format</label>
                          <select className="w-full p-2 rounded-md border bg-background text-sm">
                            <option value="mp3">MP3 (Recommended)</option>
                            <option value="wav">WAV</option>
                            <option value="pcm">PCM</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-sm font-medium mb-2 block">Quality</label>
                          <select className="w-full p-2 rounded-md border bg-background text-sm">
                            <option value="high">High Quality (192kbps)</option>
                            <option value="medium">Medium Quality (128kbps)</option>
                            <option value="low">Low Quality (64kbps)</option>
                          </select>
                        </div>
                        <Separator />
                        <Button variant="default" className="w-full" onClick={() => toast.success('Exporting audio...')}>
                          <Save className="h-4 w-4 mr-2" />
                          Export Audio
                        </Button>
                        <Button variant="outline" className="w-full" onClick={() => toast.success('Script exported!')}>
                          <FileText className="h-4 w-4 mr-2" />
                          Export Script
                        </Button>
                        <Button variant="outline" className="w-full" onClick={() => toast.success('Project exported!')}>
                          <Music className="h-4 w-4 mr-2" />
                          Export Project
                        </Button>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </ScrollArea>
              </Tabs>
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </div>
  )
}
