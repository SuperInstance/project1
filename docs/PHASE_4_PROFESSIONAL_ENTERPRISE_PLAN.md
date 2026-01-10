# Phase 4: Professional & Enterprise Implementation Plan

## 🎯 Objective

Transform Podcast Maker into a **professional and enterprise-grade podcast creation platform** with standalone executable version, multi-user collaboration, and advanced analytics.

## 📊 Architecture Overview

```
【Phase 3: Advanced Features】
Multi-Agent System → Extended with Enterprise Features
    ↓
Content Analysis → Enhanced with Auto-Planning
Script Writing → Advanced with Markdown Parser
Audio Generation → Premium TTS Integration
Web Scraping → Firecrawl + Crawl4AI
MCP Extensions → Multiple External Tools
    ↓
【Phase 4: Professional & Enterprise】
Standalone Executable → Electron + Next.js
    ↓
Mini-Service Architecture
    ↓
    ├─→ Folder Scanning & Watching
    ├─→ Config Wizard (First-Run Setup)
    ├─→ Dual Config System (API Keys + Instructions)
    ├─→ Local Web Server (localhost:3000)
    └─→ Background File Sync
    ↓
Multi-User Collaboration → Cloud Storage & Real-Time
    ↓
    ├─→ Shared Workspaces
    ├─→ Version Control (Git-like for Scripts)
    ├─→ Real-Time Collaborative Editing
    └─→ Role-Based Access Control
    ↓
Enterprise Features → Billing, Analytics, White-Label
    ↓
    ├─→ Usage Tracking per Workspace
    ├─→ Cost Estimation & Budget Controls
    ├─→ Listener Analytics & Feedback
    ├─→ A/B Testing for Content
    └─→ White-Label Deployment Options
```

### Key Technologies

| Technology | Purpose | Version |
|------------|---------|--------|
| **Electron** | Desktop bundler | Latest |
| **Next.js** | Web framework | ^15 |
| **Drizzle ORM** | Type-safe database | ^0.31.0 |
| **Better-Sqlite3** | Embedded database | Latest |
| **Supabase** | Cloud storage & real-time | Latest |
| **Stripe** | Payments & billing | ^14.0 |
| **Next-Auth v5** | Authentication | Latest |
| **PostHog** | Analytics & tracking | Latest |
| **React-Hot-Toast** | Real-time notifications | ^2 |
| **Zust** | Lightweight state management | ^4.0 |
| **Immer** | Immutable state updates | ^10.0 |
| **tRPC** | Type-safe APIs | ^10 |
| **Turbopack** | Build tool for Electron | ^0.2 |
| **Auto-Loader** | Config wizard & folder scanning | ^8.0 |

## 🚀 Implementation Roadmap

### Task 1: Standalone Executable with Electron

**Goal:** Create desktop application that runs without requiring Node.js or browser

#### 1.1 Electron Main Process Setup
```typescript
// electron/main.ts
import { app, BrowserWindow, ipcMain, shell } from 'electron'
import * as path from 'path'
import { fileURLToPath } from 'electron'

// Create main browser window
function createWindow(): BrowserWindow {
  const mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1200,
    minHeight: 700,
    frame: false,
    backgroundColor: '#ffffff',
    webPreferences: {
      nodeIntegration: true,
      nodeIntegrationInWorker: true,
      contextIsolation: false,
      enableRemoteModule: false,
      webSecurity: false
    }
  })

  // Load the app
  if (process.env.NODE_ENV === 'development') {
    mainWindow.loadURL('http://localhost:3000')
    mainWindow.webContents.openDevTools()
  } else {
    mainWindow.loadFileURL(fileURLToPath(__dirname, '../dist/index.html'))
  }

  return mainWindow
}

// IPC handlers
ipcMain.handle('folder:scan', async (event, folderPath: string) => {
  const files = await scanProjectFolder(folderPath)
  event.reply('folder:scan:result', { files, success: true })
})

ipcMain.handle('config:save', async (event, config: any) => {
  await saveConfig(config)
  event.reply('config:saved', { success: true })
})

ipcMain.handle('config:get', async (event) => {
  const config = await loadConfig()
  event.reply('config:get:result', config)
})

// App lifecycle
app.whenReady().then(() => {
  console.log('Electron app ready')
  
  // Check if config exists, if not show wizard
  const configExists = await configFileExists()
  if (!configExists) {
    createWindow().webContents.send('config:show-wizard')
  } else {
    createWindow()
  }
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
```

**Features:**
- Main window with Next.js app embedded
- IPC communication between main and renderer
- Folder scanning for podcast files
- Config save/load with encryption
- Auto-updates for production builds

#### 1.2 Electron Preload Script
```typescript
// electron/preload.ts
import { contextBridge, ipcRenderer } from 'electron'

// Expose protected APIs to renderer
contextBridge.exposeInMainWorld('electronAPI', {
  folder:scan: (folderPath: string) => ipcRenderer.invoke('folder:scan', folderPath),
  config:save: (config: any) => ipcRenderer.invoke('config:save', config),
  config:get: () => ipcRenderer.invoke('config:get'),
  minimize: () => ipcRenderer.invoke('window:minimize'),
  maximize: () => ipcRenderer.invoke('window:maximize'),
  close: () => ipcRenderer.invoke('window:close')
})
```

**Features:**
- Secure IPC communication
- Type-safe API exposure
- Window control functions

#### 1.3 Config Wizard Component
```typescript
// src/components/config-wizard.tsx
'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import { ArrowLeft, ArrowRight, Check, FolderOpen, Lock, Database } from 'lucide-react'
import { toast } from 'sonner'

type Step = 1 | 2 | 3 | 4 | 5

export function ConfigWizard() {
  const [currentStep, setCurrentStep] = useState<Step>(1)
  const [config, setConfig] = useState({
    projectName: '',
    workspace: '',
    apiKey: '',
    theme: 'light',
    language: 'en',
    autoSave: true,
    notifications: true
  })

  const steps = [
    {
      step: 1,
      title: 'Welcome',
      description: 'Let\'s set up your podcast maker workspace',
      content: (
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <Database className="h-12 w-12 text-primary" />
            <div>
              <h3 className="text-lg font-semibold">Welcome to Podcast Maker!</h3>
              <p className="text-muted-foreground">This wizard will help you configure your workspace in just a few steps.</p>
            </div>
          </div>
          <div className="bg-muted/50 p-4 rounded-lg">
            <p className="text-sm">What you'll set up:</p>
            <ul className="list-disc list-inside space-y-1 text-sm ml-4">
              <li>Project workspace and file locations</li>
              <li>API keys for premium services (ElevenLabs, Firecrawl, etc.)</li>
              <li>Default settings and preferences</li>
              <li>Audio storage and export options</li>
              <li>User account and collaboration settings</li>
            </ul>
          </div>
        </div>
      )
    },
    {
      step: 2,
      title: 'Project Setup',
      description: 'Configure your project workspace',
      content: (
        <div className="space-y-4">
          <div className="space-y-3">
            <div>
              <Label htmlFor="projectName">Project Name</Label>
              <Input
                id="projectName"
                value={config.projectName}
                onChange={(e) => setConfig({...config, projectName: e.target.value})}
                placeholder="My Podcast Workspace"
                className="w-full"
              />
            </div>
            <div>
              <Label htmlFor="workspace">Workspace Location</Label>
              <div className="flex gap-2">
                <Input
                  id="workspace"
                  value={config.workspace}
                  onChange={(e) => setConfig({...config, workspace: e.target.value})}
                  placeholder="/home/username/my-podcasts"
                  className="flex-1"
                />
                <Button variant="outline" size="icon" onClick={() => selectFolder()}>
                  <FolderOpen className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      step: 3,
      title: 'API Keys',
      description: 'Add your API keys for premium services',
      content: (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground mb-4">
            Podcast Maker uses these premium services for advanced features:
          </p>
          <div className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="elevenlabsKey">ElevenLabs (Premium TTS)</Label>
              <div className="flex gap-2">
                <Input
                  id="elevenlabsKey"
                  type="password"
                  value={config.apiKey}
                  onChange={(e) => setConfig({...config, apiKey: e.target.value})}
                  placeholder="sk-..."
                  className="flex-1"
                />
                <a href="https://elevenlabs.io" target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline">
                  Get API Key
                </a>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="firecrawlKey">Firecrawl (Web Scraping)</Label>
              <div className="flex gap-2">
                <Input
                  id="firecrawlKey"
                  type="password"
                  value={config.apiKey}
                  onChange={(e) => setConfig({...config, apiKey: e.target.value})}
                  placeholder="fc-..."
                  className="flex-1"
                />
                <a href="https://firecrawl.dev" target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline">
                  Get API Key
                </a>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="crawl4aiKey">Crawl4AI (Auth Pages)</Label>
              <div className="flex gap-2">
                <Input
                  id="crawl4aiKey"
                  type="password"
                  value={config.apiKey}
                  onChange={(e) => setConfig({...config, apiKey: e.target.value})}
                  placeholder="ck-..."
                  className="flex-1"
                />
                <a href="https://crawl4ai.com" target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline">
                  Get API Key
                </a>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      step: 4,
      title: 'Preferences',
      description: 'Configure your default settings',
      content: (
        <div className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label htmlFor="theme">Theme</Label>
              <select
                id="theme"
                value={config.theme}
                onChange={(e) => setConfig({...config, theme: e.target.value as 'light' | 'dark'})}
                className="w-48"
              >
                <option value="light">Light</option>
                <option value="dark">Dark</option>
                <option value="system">System</option>
              </select>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label htmlFor="language">Language</Label>
              <select
                id="language"
                value={config.language}
                onChange={(e) => setConfig({...config, language: e.target.value as 'en' | 'es' | 'fr' | 'de'})}
                className="w-48"
              >
                <option value="en">English</option>
                <option value="es">Español</option>
                <option value="fr">Français</option>
                <option value="de">Deutsch</option>
              </select>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="autoSave"
                checked={config.autoSave}
                onChange={(e) => setConfig({...config, autoSave: e.target.checked})}
              />
              <Label htmlFor="autoSave">Auto-save drafts</Label>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="notifications"
                checked={config.notifications}
                onChange={(e) => setConfig({...config, notifications: e.target.checked})}
              />
              <Label htmlFor="notifications">Enable notifications</Label>
            </div>
          </div>
        </div>
      )
    },
    {
      step: 5,
      title: 'Summary',
      description: 'Review and save your configuration',
      content: (
        <div className="space-y-4">
          <div className="bg-muted/50 p-4 rounded-lg">
            <h3 className="font-semibold mb-3">Configuration Summary</h3>
            <dl className="space-y-2">
              <div className="flex justify-between">
                <dt className="text-sm font-medium">Project Name:</dt>
                <dd className="text-sm">{config.projectName}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-sm font-medium">Workspace:</dt>
                <dd className="text-sm">{config.workspace}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-sm font-medium">API Keys:</dt>
                <dd className="text-sm">
                  {config.apiKey ? '***configured' : 'not configured'}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-mini font-medium">Theme:</dt>
                <dd className="text-sm capitalize">{config.theme}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-sm font-medium">Language:</dt>
                <dd className="text-sm capitalize">{config.language}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-sm font-medium">Auto-save:</dt>
                <dd className="text-sm">{config.autoSave ? 'enabled' : 'disabled'}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-sm font-medium">Notifications:</dt>
                <dd className="text-sm">{config.notifications ? 'enabled' : 'disabled'}</dd>
              </div>
            </dl>
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <Button variant="outline" onClick={() => setCurrentStep(4)}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <Button onClick={() => saveConfig()}>
              <Check className="h-4 w-4 mr-2" />
              Save Configuration
            </Button>
          </div>
        </div>
      )
    }
  ]

  const progress = (currentStep / steps.length) * 100

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/20 p-8">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5 text-primary" />
            <span>Podcast Maker Setup</span>
          </CardTitle>
          <CardDescription>
            Configure your podcast workspace in 5 simple steps
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Step indicator */}
          <div className="flex justify-center mb-6">
            {steps.map((step, index) => (
              <div
                key={step.step}
                className={`flex items-center ${index < currentStep ? 'text-muted-foreground' : ''} ${index > currentStep ? 'text-muted-foreground' : ''}`}
              >
                <div
                  className={`w-8 h-8 rounded-full border-2 flex items-center justify-center ${
                    index < currentStep ? 'bg-primary text-primary-foreground' : 'bg-muted'
                  }`}
                >
                  {index < currentStep && <Check className="h-4 w-4" />}
                  <span className="text-sm font-semibold">{step.step}</span>
                  {index > currentStep && <ArrowRight className="h-4 w-4" />}
                </div>
                {index < currentStep && (
                  <div className="ml-4">
                    <ArrowRight className="h-4 w-4" />
                  </div>
                )}
              </div>
            ))
          </div>
          <Progress value={progress} className="w-full mb-6" />

          {/* Current step content */}
          {steps[currentStep - 1].content}
        </CardContent>
      </Card>
    </div>
  )
}
```

**Features:**
- 5-step wizard for first-time setup
- Project workspace configuration
- Secure API key management
- Theme and language preferences
- Auto-save and notification settings
- Configuration summary and save

#### 1.4 Dual Configuration System
```typescript
// src/lib/config.ts
import { join } from 'path'
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs'
import { homedir } from 'os'
import { app } from 'electron'
import { decrypt, encrypt } from 'crypto'

interface Config {
  projectName: string
  workspace: string
  apiKeys: {
    elevenLabs?: string
    firecrawl?: string
    crawl4ai?: string
  }
  preferences: {
    theme: 'light' | 'dark' | 'system'
    language: string
    autoSave: boolean
    notifications: boolean
  }
  collaboration: {
    supabaseUrl?: string
    workspaceId?: string
  }
}

const CONFIG_DIR = join(homedir(), '.podcast-maker')
const CONFIG_FILE = join(CONFIG_DIR, 'config.json')
const API_KEYS_FILE = join(CONFIG_DIR, 'api-keys.json')
const INSTRUCTIONS_FILE = join(CONFIG_DIR, 'instructions.json')

// Encryption key
const ENCRYPTION_KEY = process.env.CONFIG_ENCRYPTION_KEY || 'podcast-maker-2024'

export function loadConfig(): Config {
  if (!existsSync(CONFIG_FILE)) {
    return getDefaultConfig()
  }

  const encrypted = readFileSync(CONFIG_FILE, 'utf-8')
  const decrypted = decrypt(encrypted.toString(), ENCRYPTION_KEY)
  return JSON.parse(decrypted)
}

export function saveConfig(config: Config): void {
  mkdirSync(CONFIG_DIR, { recursive: true })
  const encrypted = encrypt(JSON.stringify(config, null, 2), ENCRYPTION_KEY)
  writeFileSync(CONFIG_FILE, encrypted, 'utf-8')
}

export function loadApiKeys() {
  if (!existsSync(API_KEYS_FILE)) {
    return {}
  }

  const encrypted = readFileSync(API_KEYS_FILE, 'utf-8')
  const decrypted = decrypt(encrypted.toString(), ENCRYPTION_KEY)
  return JSON.parse(decrypted)
}

export function saveApiKeys(keys: Record<string, string>) {
  mkdirSync(CONFIG_DIR, { recursive: true })
  const encrypted = encrypt(JSON.stringify(keys, null, 2), ENCRYPTION_KEY)
  writeFileSync(API_KEYS_FILE, encrypted, 'utf-8')
}

export function loadInstructions() {
  if (!existsSync(INSTRUCTIONS_FILE)) {
    return getDefaultInstructions()
  }

  return readFileSync(INSTRUCTIONS_FILE, 'utf-8')
}

export function saveInstructions(instructions: any) {
  mkdirSync(CONFIG_DIR, { recursive: true })
  writeFileSync(INSTRUCTIONS_FILE, JSON.stringify(instructions, null, 2), 'utf-8')
}

function getDefaultConfig(): Config {
  return {
    projectName: 'My Podcast Workspace',
    workspace: join(homedir(), 'podcast-maker', 'projects'),
    apiKeys: {},
    preferences: {
      theme: 'light',
      language: 'en',
      autoSave: true,
      notifications: true
    },
    collaboration: {}
  }
}

// Config file access from renderer
contextBridge.exposeInMainWorld('electronAPI', {
  config: {
    get: loadConfig,
    save: saveConfig
  },
  apiKeys: {
    get: loadApiKeys,
    save: saveApiKeys
  },
  instructions: {
    get: loadInstructions,
    save: saveInstructions
  }
})
```

**Features:**
- Encrypted config file for security
- Separate API keys file (not in instructions)
- Dual system: user preferences + agent instructions
- File-based persistence
- Encrypted for local storage

### Task 2: Multi-User Collaboration

**Goal:** Enable teams to create podcasts together

#### 2.1 Database Schema with Drizzle
```typescript
// prisma/schema.prisma
import { boolean, pgTable } from 'drizzle-orm/pg-core'
import { sql, text, timestamp, uuid } from 'drizzle-orm'
import { relations } from 'drizzle-orm/pg-core'

// Users
export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  email: text('email').notNull().unique(),
  name: text('name').notNull(),
  avatar: text('avatar'),
  role: text('role').default('user'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
  workspaceId: uuid('workspace_id').notNull()
})

// Workspaces
export const workspaces = pgTable('workspaces', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  ownerId: uuid('owner_id').notNull().references(() => users, { fields: [id], references: [ownerId] }),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
  isPublic: boolean('is_public').default(false),
  memberIds: uuid('member_ids').array().default([]),
  memberInvites: text('member_invites').array().default([]),
  storage: jsonb('storage').$type(),
  settings: jsonb('settings').$type()
})

// Workspace Members
export const workspaceMembers = pgTable('workspace_members', {
  id: uuid('id').defaultRandom().primaryKey(),
  workspaceId: uuid('workspace_id').notNull().references(() => workspaces, { fields: [id], references: [workspaceId] }),
  userId: uuid('user_id').notNull().references(() => users, { fields: [id], references: [userId] }),
  role: text('role').default('member'),
  permissions: jsonb('permissions').$type(),
  joinedAt: timestamp('joined_at').defaultNow(),
  lastSeen: timestamp('last_seen').defaultNow()
})

// Projects
export const projects = pgTable('projects', {
  id: uuid('id').defaultRandom().primaryKey(),
  workspaceId: uuid('workspace_id').notNull().references(() => workspaces, { fields: [id], references: [workspaceId] }),
  name: text('name').notNull(),
  description: text('description'),
  createdBy: uuid('created_by').references(() => users, { fields: [id], references: [createdBy] }),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
  isPublic: boolean('is_public').default(false),
  tags: text('tags').array().default([]),
  settings: jsonb('settings').$type()
})

// Scripts (with version history)
export const scripts = pgTable('scripts', {
  id: uuid('id').defaultRandom().primaryKey(),
  projectId: uuid('project_id').references(() => projects, { fields: [id], references: [projectId] }),
  version: integer('version').default(1),
  content: text('content').notNull(),
  createdBy: uuid('created_by').references(() => users, { fields: [id], references: [createdBy] }),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
  isCurrent: boolean('is_current').default(true)
})

// Script Versions
export const scriptVersions = pgTable('script_versions', {
  id: uuid('id').defaultRandom().primaryKey(),
  scriptId: uuid('script_id').references(() => scripts, { fields: [id], references: [scriptId] }),
  version: integer('version').default(1),
  changes: jsonb('changes').$type().$default({}),
  createdAt: timestamp('created_at').defaultNow(),
  createdBy: uuid('created_by').references(() => users, { fields: [id], references: [createdBy] })
})

// Real-time Collaboration State
export const collaborationState = pgTable('collaboration_state', {
  id: uuid('id').defaultRandom().primaryKey(),
  scriptId: uuid('script_id').references(() => scripts, { fields: [id], references: [scriptId] }),
  userId: uuid('user_id').references(() => users, { fields: [id], references: [userId] }),
  cursor: integer('cursor').default(0),
  content: text('content').notNull(),
  isSynced: boolean('is_synced').default(false),
  lastUpdated: timestamp('last_updated').defaultNow()
})

// Comments
export const comments = pgTable('comments', {
  id: uuid('id').defaultRandom().primaryKey(),
  scriptId: uuid('script_id').references(() => scripts, { fields: [id], references: [scriptId] }),
  userId: uuid('user_id').references(() => users, { fields: [id], references: [userId] }),
  content: text('content').notNull(),
  parentId: uuid('parent_id').references(() => comments, { fields: [id], references: [parentId] }),
  createdAt: timestamp('created_at').defaultNow(),
  resolved: boolean('resolved').default(false)
})
```

**Features:**
- Users with workspaces and role-based access
- Projects with tags and settings
- Scripts with full version history
- Real-time collaboration state tracking
- Comments with threading support
- Foreign key relationships for data integrity

#### 2.2 Real-Time Collaboration
```typescript
// src/lib/realtime.ts
import { createClient } from '@supabase/supabase-js'
import { RealtimeChannel } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

export const realtime = createClient(supabaseUrl, supabaseKey)

export function subscribeToScript(scriptId: string, callback: (payload: any) => void) {
  return realtime
    .channel(`script:${scriptId}`)
    .on('postgres_changes', (payload) => callback(payload))
    .subscribe()
}

export function broadcastScriptUpdate(scriptId: string, update: any) {
  return realtime
    .channel(`script:${scriptId}`)
    .send({
      type: 'script_update',
      payload: update
    })
}

export function broadcastCursorUpdate(scriptId: string, userId: string, cursor: number) {
  return realtime
    .channel(`script:${scriptId}`)
    .send({
      type: 'cursor_update',
      payload: { userId, cursor }
    })
}
```

**Features:**
- Real-time script updates to all collaborators
- Cursor position synchronization
- User presence tracking (who's editing where)
- Conflict detection and resolution

#### 2.3 Collaboration UI Components
```typescript
// src/components/collaboration/collaborators-panel.tsx
'use client'

import { useState, useEffect } from 'react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Users, UserPlus, Copy, Share, MoreHorizontal } from 'lucide-react'

interface Member {
  id: string
  name: string
  avatar?: string
  role: 'owner' | 'editor' | 'viewer'
  isOnline: boolean
}

export function CollaboratorsPanel({ workspaceId }: { workspaceId: string }) {
  const [members, setMembers] = useState<Member[]>([])
  const [isOwner, setIsOwner] = useState(false)

  useEffect(() => {
    // Fetch workspace members
    async function fetchMembers() {
      const response = await fetch(`/api/workspaces/${workspaceId}/members`)
      const data = await response.json()
      setMembers(data.members)
      
      // Check if current user is owner
      const currentUser = await fetch('/api/auth/user')
      const userData = await currentUser.json()
      setIsOwner(userData.id === data.members.find(m => m.role === 'owner')?.id)
    }
    
    fetchMembers()
    
    // Subscribe to member updates
    const unsubscribe = subscribeToWorkspaceMembers(workspaceId, (payload) => {
      if (payload.type === 'member_added') {
        setMembers(prev => [...prev, payload.member])
      } else if (payload.type === 'member_removed') {
        setMembers(prev => prev.filter(m => m.id !== payload.member.id))
      } else if (payload.type === 'member_updated') {
        setMembers(prev => prev.map(m => m.id === payload.member.id ? payload.member : m))
      }
    })
    
    return () => unsubscribe()
  }, [workspaceId])

  const roleLabels = {
    owner: 'Owner',
    editor: 'Editor',
    viewer: 'Viewer'
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5 text-muted-foreground" />
          <h3 className="font-semibold">Team Members</h3>
          <Badge variant="secondary">{members.length}</Badge>
        </div>
        {isOwner && (
          <Button variant="outline" size="sm">
            <UserPlus className="h-4 w-4 mr-2" />
            Invite Member
          </Button>
        )}
      </div>
    </div>

    {/* Members list */}
    <div className="space-y-2">
      {members.map((member) => (
        <div key={member.id} className="flex items-center justify-between p-3 bg-card rounded-lg border">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <div className="font-medium">{member.name}</div>
              <div className="flex items-center gap-2">
                <Badge variant={member.isOnline ? 'default' : 'secondary'}>
                  {member.isOnline ? 'Online' : 'Offline'}
                </Badge>
                <Badge variant="outline">{roleLabels[member.role]}</Badge>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isOwner && member.role !== 'owner' && (
              <Button variant="ghost" size="icon" onClick={() => changeRole(member.id, 'editor')}>
                Make Editor
              </Button>
            )}
            <Button variant="ghost" size="icon" onClick={() => removeMember(member.id)}>
              Remove
            </Button>
          </div>
        </div>
      ))}
    </div>

    {/* Invite member dialog */}
    <div className="flex justify-center">
      <Button variant="outline">
        <Share className="h-4 w-4 mr-2" />
        Share Workspace Link
      </Button>
    </div>
  </div>
  )
}
```

**Features:**
- Real-time member list updates
- User presence indicators
- Role-based permissions (owner, editor, viewer)
- Invite new members with email
- Remove members (if owner)
- Share workspace link for easy join

### Task 3: Enterprise Features

**Goal:** Add billing, analytics, and white-label deployment

#### 3.1 Billing & Usage Tracking
```typescript
// src/lib/billing.ts
import Stripe from 'stripe'
import { prisma } from '@/lib/db'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

export async function createSubscription(userId: string, plan: 'basic' | 'pro' | 'enterprise') {
  const priceId = {
    basic: process.env.STRIPE_PRICE_BASIC,
    pro: process.env.STRIPE_PRICE_PRO,
    enterprise: process.env.STRIPE_PRICE_ENTERPRISE
  }[plan]

  const session = await stripe.checkout.sessions.create({
    customer: (await getOrCreateCustomer(userId)).id,
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [{
      price: priceId,
      quantity: 1,
    }],
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/billing/success`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/billing/cancel`,
  })

  return session.url
}

export async function getUsageStats(userId: string): Promise<{
  episodesCreated: number
  minutesGenerated: number
  apiCallsMade: number
  costThisMonth: number
  remainingCredits: number
}> {
  const stats = await prisma.usage.findFirst({
    where: { userId }
  })

  return {
    episodesCreated: stats?.episodesCreated || 0,
    minutesGenerated: stats?.minutesGenerated || 0,
    apiCallsMade: stats?.apiCallsMade || 0,
    costThisMonth: stats?.costThisMonth || 0,
    remainingCredits: stats?.remainingCredits || 0
  }
}

export async function trackUsage(userId: string, type: string, units: number) {
  await prisma.usage.upsert({
    where: { userId },
    update: {
      [type]: { increment: units },
      costThisMonth: { increment: calculateCost(type, units) }
    }
  })
}
```

**Features:**
- Stripe payment integration
- Subscription management (basic, pro, enterprise)
- Usage tracking per user
- Credit system for prepaid plans
- Cost calculation and billing history

#### 3.2 Analytics & Listener Feedback
```typescript
// src/lib/analytics.ts
import { prisma } from '@/lib/db'

export async function trackEpisodeEvent(event: {
  type: 'play' | 'download' | 'share'
  episodeId: string
  workspaceId: string
}) {
  await prisma.analytics.create({
    data: {
      eventType: event.type,
      episodeId,
      workspaceId,
      timestamp: new Date()
    }
  })
}

export async function getEpisodeAnalytics(episodeId: string) {
  const events = await prisma.analytics.findMany({
    where: { episodeId }
  })

  const plays = events.filter(e => e.eventType === 'play').length
  const downloads = events.filter(e => e.eventType === 'download').length
  const shares = events.filter(e => e.eventType === 'share').length
  
  // Calculate engagement score
  const engagementScore = (plays * 3) + (downloads * 2) + (shares * 1)
  
  return {
    totalPlays: plays,
    totalDownloads: downloads,
    totalShares: shares,
    engagementScore,
    retentionRate: events.length > 0 ? (plays / events.length) * 100 : 0
  }
}

export async function getWorkspaceAnalytics(workspaceId: string) {
  const stats = await prisma.$queryRaw`
    SELECT 
      COUNT(DISTINCT id) FILTER (WHERE created_at >= NOW() - INTERVAL '30 days') as projects_last_30,
      SUM(minutes_generated) FILTER (WHERE created_at >= NOW() - INTERVAL '30 days') as minutes_generated_last_30,
      AVG(DATE_PART('minutes_generated', 'day')) FILTER (WHERE created_at >= NOW() - INTERVAL '30 days') as avg_minutes_per_day
    FROM projects
    WHERE workspace_id = ${workspaceId}
  `

  return {
    projectsCreated: stats.projects_last_30[0].projects_created_last_30,
    totalMinutesGenerated: stats.minutes_generated_last_30[0].minutes_generated_last_30,
    avgMinutesPerDay: stats.avg_minutes_per_day[0].avg_minutes_per_day,
    growthRate: calculateGrowthRate(stats)
  }
}
```

**Features:**
- Episode event tracking (play, download, share)
- Engagement score calculation
- Workspace analytics
- Growth rate tracking
- Retention metrics

#### 3.3 White-Label Deployment
```typescript
// src/lib/white-label.ts
export interface WhiteLabelConfig {
  appName: string
  primaryColor: string
  logoUrl?: string
  customDomain?: string
  supportEmail?: string
  companyName?: string
  termsOfServiceUrl?: string
  privacyPolicyUrl?: string
  faviconUrl?: string
}

export function getWhiteLabelConfig(workspaceId: string): Promise<WhiteLabelConfig | null> {
  const config = await prisma.workspaceSettings.findFirst({
    where: { workspaceId }
  })

  if (!config?.isWhiteLabel) {
    return null
  }

  return {
    appName: config.appName || 'Podcast Maker',
    primaryColor: config.primaryColor || '#8b5cf',
    logoUrl: config.logoUrl,
    customDomain: config.customDomain,
    supportEmail: config.supportEmail,
    companyName: config.companyName,
    termsOfServiceUrl: config.termsOfServiceUrl,
    privacyPolicyUrl: config.privacyPolicyUrl,
    faviconUrl: config.faviconUrl
  }
}

export function applyWhiteLabelTheme(config: WhiteLabelConfig) {
  if (typeof document !== 'undefined') {
    document.documentElement.style.setProperty('--primary', config.primaryColor)
    
    if (config.faviconUrl) {
      const favicon = document.querySelector('link[rel="icon"]')
      if (favicon) {
        favicon.href = config.faviconUrl
      }
    }
    
    if (document.title !== config.appName) {
      document.title = config.appName
    }
  }
}
```

**Features:**
- Custom branding (colors, logos, domains)
- Remove all Podcast Maker branding
- Custom company name and support info
- White-label deployment domains
- Terms of service and privacy policy links

## 📋 Implementation Tasks

### Priority 1: Standalone Executable (Electron)
- [ ] Create electron/main.ts with IPC handlers
- [ ] Create electron/preload.ts for secure IPC
- [ ] Create config-wizard.tsx component
- [ ] Implement dual config system (api-keys + instructions)
- [ ] Add folder scanning logic
- [ ] Create Turbopack configuration
- [ ] Test Electron build locally
- [ ] Package for Windows, Mac, and Linux

### Priority 2: Multi-User Collaboration
- [ ] Define database schema with Drizzle
- [ ] Set up PostgreSQL database connection
- [ ] Create user and workspace models
- [ ] Implement project and script models with versioning
- [ ] Set up Supabase real-time subscriptions
- [ ] Create collaborators-panel component
- [ ] Implement real-time script updates via websockets
- [ ] Add role-based access control (owner, editor, viewer)
- [ ] Create invite member functionality
- [ ] Add workspace sharing via links

### Priority 3: Enterprise Features
- [ ] Set up Stripe integration
- [ ] Create subscription plans (basic, pro, enterprise)
- [ ] Implement usage tracking database
- [ ] Create billing dashboard UI
- [ ] Integrate PostHog for analytics
- [ ] Track episode events (play, download, share)
- [ ] Create analytics dashboard with metrics
- [ ] Implement white-label configuration
- [ ] Add custom branding support
- [ ] Set up credit system for prepaid plans

### Priority 4: Testing & Deployment
- [ ] Test all features locally
- [ ] Performance optimization
- [ ] Security audit (API keys, IPC, database)
- [ ] Create deployment documentation
- [ ] Set up CI/CD pipeline
- [ ] Package for production distribution
- [ ] Create update mechanism

## 🎯 Success Criteria for Phase 4

Phase 4 is complete when:

1. ✅ **Standalone Executable**
   - Electron app runs without Node.js/browser
   - Config wizard works for first-time setup
   - Folder scanning and watching implemented
   - Dual config system (API keys separate from instructions)
   - Local web server on localhost:3000

2. ✅ **Multi-User Collaboration**
   - Users can create workspaces
   - Role-based access control (owner, editor, viewer)
   - Real-time script editing with cursor sync
   - Version history for all scripts
   - Team member invitations
   - Workspace sharing via links

3. ✅ **Enterprise Features**
   - Billing integration with Stripe
   - Usage tracking per user/workspace
   - Episode analytics (plays, downloads, shares)
   - White-label deployment support
   - Custom branding options
   - Credit system and subscription plans

## 📚 Resources

### Documentation
- Electron Docs: https://www.electronjs.org/docs
- Drizzle ORM: https://orm.drizzle.team/docs/overview
- Supabase Docs: https://supabase.com/docs/guides/realtime
- Stripe API: https://stripe.com/docs/api
- PostHog Docs: https://posthog.com/docs
- Next.js Docs: https://nextjs.org/docs

### Libraries
- Zust: https://github.com/pmndrs/zust
- Immer: https://immerjs.github.io/immer
- tRPC: https://trpc.io
- React-Hot-Toast: https://github.com/ramonak/react-hot-toast
- Turbopack: https://turbo.build/pack/docs

### Time Estimates

- **Electron App**: 24-32 hours
- **Config Wizard**: 8-12 hours
- **Dual Config System**: 6-8 hours
- **Database Schema & Models**: 16-20 hours
- **Supabase Real-Time**: 12-16 hours
- **Stripe Billing**: 16-24 hours
- **Analytics Integration**: 12-16 hours
- **White-Label Deployment**: 8-12 hours
- **Testing & Optimization**: 16-24 hours

**Total Phase 4: 112-152 hours**

## 🚀 Next: Full Platform Release

After Phase 4 completion, the platform will have:

1. **Desktop Application** - Runs standalone on Windows, Mac, and Linux
2. **Team Collaboration** - Multiple users working together in real-time
3. **Billing System** - Flexible plans with usage tracking
4. **Analytics** - Deep insights into content performance
5. **Enterprise Deployment** - White-label solution for businesses

**Podcast Maker will be a complete, professional-grade podcast creation platform suitable for individual creators, teams, and enterprise customers!** 🎯
