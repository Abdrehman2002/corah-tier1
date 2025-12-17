'use client'

import { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Phone, CheckCircle, PhoneOff, Mic, MicOff } from 'lucide-react'
import { cn } from '@/lib/utils'
import { RetellWebClient } from 'retell-client-js-sdk'

interface Agent {
  id: string
  name: string
  description: string
  agentId: string
  features: string[]
}

const AGENTS: Agent[] = [
  {
    id: '1',
    name: 'AutoCare Receptionist',
    description: 'Takes service & maintenance bookings',
    agentId: 'agent_68d22a69f45a3ee37168684831',
    features: ['Schedule repairs', 'Service history', 'Emergency handling'],
  },
  {
    id: '2',
    name: 'Real Estate Receptionist',
    description: 'Handles buyer & seller inquiries',
    agentId: 'agent_71d88e63296903b65f6dc0d372',
    features: ['Property tours', 'Price inquiries', 'Agent scheduling'],
  },
  {
    id: '3',
    name: 'Medical Receptionist',
    description: 'Books appointments, routes patients',
    agentId: 'agent_8ce17d51123f73b631cb29c6e0',
    features: ['Appointments', 'Insurance', 'Prescriptions'],
  },
  {
    id: '4',
    name: 'Law Firm Receptionist',
    description: 'Screens legal clients & schedules consults',
    agentId: 'agent_2c8c98f3046de28c6c9d7fa086',
    features: ['Case screening', 'Consultations', 'Documents'],
  },
  {
    id: '5',
    name: 'Spa/Salon Receptionist',
    description: 'Manages spa & salon bookings',
    agentId: 'agent_26634c1417075ff72793ffe658',
    features: ['Service booking', 'Stylist selection', 'Packages'],
  },
  {
    id: '6',
    name: 'Fitness/Gym Receptionist',
    description: 'Handles gym tours & memberships',
    agentId: 'agent_6ecbb6ef0fa72411251e18a0a1',
    features: ['Memberships', 'Class booking', 'Trainers'],
  },
  {
    id: '7',
    name: 'Corah AI',
    description: 'Custom configured agent',
    agentId: 'agent_b14e82649c409bc1cb88deb100',
    features: ['Custom features', 'Configurable', 'Flexible'],
  },
]

export default function AgentSelectorPage() {
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null)
  const [activeAgentId, setActiveAgentId] = useState<string | null>(null)
  const [activeAgentLabel, setActiveAgentLabel] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  // Retell web call state
  const [isStartingCall, setIsStartingCall] = useState(false)
  const [callError, setCallError] = useState<string | null>(null)
  const [isCallActive, setIsCallActive] = useState(false)
  const [callInfo, setCallInfo] = useState<any>(null)
  const [callStatus, setCallStatus] = useState<string>('idle')
  const [isMuted, setIsMuted] = useState(false)
  const [isAgentSpeaking, setIsAgentSpeaking] = useState(false)

  const retellWebClientRef = useRef<RetellWebClient | null>(null)

  useEffect(() => {
    retellWebClientRef.current = new RetellWebClient()
    const client = retellWebClientRef.current

    client.on('call_started', () => {
      console.log('Call started')
      setCallStatus('ongoing')
      setIsCallActive(true)
    })

    client.on('call_ended', () => {
      console.log('Call ended')
      setCallStatus('ended')
      setIsCallActive(false)
      setCallInfo(null)
      setIsAgentSpeaking(false)
    })

    client.on('agent_start_talking', () => {
      console.log('Agent started talking')
      setIsAgentSpeaking(true)
    })

    client.on('agent_stop_talking', () => {
      console.log('Agent stopped talking')
      setIsAgentSpeaking(false)
    })

    client.on('error', (error) => {
      console.error('Retell error:', error)
      setCallError(`Call error: ${error.message || 'Unknown error'}`)
      setIsCallActive(false)
    })

    return () => {
      if (retellWebClientRef.current) {
        retellWebClientRef.current.stopCall()
      }
    }
  }, [])

  const handleSaveActiveAgent = async () => {
    if (!selectedAgentId) return

    setIsSaving(true)
    setSaveError(null)
    setSuccessMessage(null)

    try {
      const response = await fetch('https://corah.app.n8n.cloud/webhook-test/agent-selector', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          agentId: selectedAgentId,
        }),
      })

      const data = await response.json()

      if (data.success) {
        setActiveAgentId(data.activeAgentId)
        setActiveAgentLabel(data.activeAgentLabel)
        setSuccessMessage(`Active agent updated to ${data.activeAgentLabel}`)
        setTimeout(() => setSuccessMessage(null), 5000)
      } else {
        setSaveError(data.message || 'Failed to update active agent')
      }
    } catch (error) {
      console.error('Error saving active agent:', error)
      setSaveError('Network error while updating active agent. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleStartWebCall = async () => {
    if (!selectedAgentId || !retellWebClientRef.current) return

    setIsStartingCall(true)
    setCallError(null)
    setCallStatus('connecting')

    try {
      const response = await fetch('/api/create-web-call', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          agent_id: selectedAgentId,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create web call')
      }

      setCallInfo(data)

      await retellWebClientRef.current.startCall({
        accessToken: data.access_token,
      })

      console.log('Web call started successfully')
    } catch (error) {
      console.error('Error starting web call:', error)
      setCallError(error instanceof Error ? error.message : 'Failed to start web call')
      setCallStatus('error')
      setIsCallActive(false)
    } finally {
      setIsStartingCall(false)
    }
  }

  const handleEndCall = () => {
    if (retellWebClientRef.current) {
      retellWebClientRef.current.stopCall()
    }
    setIsCallActive(false)
    setCallInfo(null)
    setCallError(null)
    setCallStatus('idle')
    setIsAgentSpeaking(false)
  }

  const toggleMute = () => {
    setIsMuted(!isMuted)
  }

  const selectedAgent = AGENTS.find(agent => agent.agentId === selectedAgentId)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl sm:text-3xl font-bold text-[#000000]">Agent Selector</h1>
        <p className="text-sm text-[#2A2A2A] opacity-70">
          Choose which AI receptionist should handle calls on your Twilio number, or test any agent with a web call.
        </p>
      </div>

      {/* Success Message */}
      {successMessage && (
        <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-md flex items-center gap-2">
          <CheckCircle className="h-5 w-5" />
          <span className="text-sm font-medium">{successMessage}</span>
        </div>
      )}

      {/* Error Message */}
      {saveError && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-md">
          <p className="text-sm font-medium">Error: {saveError}</p>
        </div>
      )}

      {/* Call Error Message */}
      {callError && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-md">
          <p className="text-sm font-medium">Call Error: {callError}</p>
        </div>
      )}

      {/* Active Call Interface - Corah Branded */}
      {isCallActive && (
        <Card className="border-[#000000] border-2">
          <div className="bg-[#000000] text-white px-6 py-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                {/* Corah Logo Circle */}
                <div className="h-16 w-16 rounded-full bg-white flex items-center justify-center">
                  <span className="text-2xl font-bold text-black">C</span>
                </div>
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wide">Speaking with</p>
                  <h2 className="text-xl font-bold">Corah AI</h2>
                  <p className="text-sm text-gray-400">{selectedAgent?.name || 'Agent'}</p>
                </div>
              </div>
              <Button
                onClick={handleEndCall}
                variant="outline"
                size="sm"
                className="bg-red-500 border-red-500 text-white hover:bg-red-600 hover:border-red-600"
              >
                <PhoneOff className="h-4 w-4 mr-2" />
                End Call
              </Button>
            </div>

            {/* Audio Visualizer */}
            <div className="flex items-center justify-center gap-1.5 h-16 mb-4">
              {[...Array(20)].map((_, i) => (
                <div
                  key={i}
                  className={cn(
                    "w-1 rounded-full transition-all",
                    isAgentSpeaking ? "bg-green-400" : "bg-gray-600"
                  )}
                  style={{
                    height: isAgentSpeaking ? `${Math.random() * 50 + 20}%` : '30%',
                  }}
                />
              ))}
            </div>

            {/* Status */}
            <div className="flex items-center justify-center gap-2 mb-4">
              <div className={cn(
                "h-2 w-2 rounded-full",
                isAgentSpeaking ? "bg-green-400 animate-pulse" : "bg-gray-500"
              )} />
              <span className="text-sm">
                {isAgentSpeaking ? 'Corah is speaking...' : 'Listening...'}
              </span>
            </div>

            {/* Mute Button */}
            <div className="flex justify-center">
              <Button
                onClick={toggleMute}
                variant="outline"
                size="sm"
                className={cn(
                  isMuted
                    ? "bg-red-500 border-red-500 text-white hover:bg-red-600"
                    : "bg-white text-black hover:bg-gray-100"
                )}
              >
                {isMuted ? <MicOff className="h-4 w-4 mr-2" /> : <Mic className="h-4 w-4 mr-2" />}
                {isMuted ? 'Unmute' : 'Mute'}
              </Button>
            </div>
          </div>

          <CardContent className="pt-4">
            {callInfo && (
              <div className="grid grid-cols-3 gap-3 text-sm">
                <div className="p-3 bg-[#F8F6F2] rounded-md">
                  <p className="text-xs text-muted-foreground mb-1">Call ID</p>
                  <p className="font-mono text-xs truncate">{callInfo.call_id}</p>
                </div>
                <div className="p-3 bg-[#F8F6F2] rounded-md">
                  <p className="text-xs text-muted-foreground mb-1">Status</p>
                  <p className="font-medium capitalize">{callStatus}</p>
                </div>
                <div className="p-3 bg-[#F8F6F2] rounded-md">
                  <p className="text-xs text-muted-foreground mb-1">Powered by</p>
                  <p className="font-bold">Corah</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Currently Active Agent */}
      {activeAgentLabel && !isCallActive && (
        <Card className="border-green-200 bg-green-50">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              Currently Active Agent
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm font-medium text-[#000000]">{activeAgentLabel}</p>
            <p className="text-xs text-[#2A2A2A] opacity-70 mt-1">
              Agent ID: {activeAgentId}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Agent Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {AGENTS.map((agent) => {
          const isSelected = selectedAgentId === agent.agentId
          const isActive = activeAgentId === agent.agentId

          return (
            <Card
              key={agent.id}
              className={cn(
                'cursor-pointer transition-all duration-200 hover:shadow-md',
                isSelected && 'ring-2 ring-[#000000] border-[#000000]',
                isActive && 'border-green-500'
              )}
              onClick={() => !isCallActive && setSelectedAgentId(agent.agentId)}
            >
              <CardHeader className="space-y-1 pb-3">
                <div className="flex items-start justify-between">
                  <Phone className="h-5 w-5 text-[#2A2A2A]" />
                  {isActive && (
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">
                      Active
                    </span>
                  )}
                  {isSelected && !isActive && (
                    <div className="h-5 w-5 rounded-full bg-[#000000] flex items-center justify-center">
                      <CheckCircle className="h-3 w-3 text-white" />
                    </div>
                  )}
                </div>
                <CardTitle className="text-base">{agent.name}</CardTitle>
                <CardDescription className="text-sm">
                  {agent.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {/* Features */}
                <div className="flex flex-wrap gap-1.5">
                  {agent.features.map((feature, idx) => (
                    <span
                      key={idx}
                      className="text-xs bg-[#F8F6F2] text-[#2A2A2A] px-2 py-1 rounded-md"
                    >
                      {feature}
                    </span>
                  ))}
                </div>
                <div className="pt-2 border-t">
                  <p className="text-xs text-[#2A2A2A] opacity-50 font-mono truncate">
                    {agent.agentId}
                  </p>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end gap-3 pt-4">
        <Button
          onClick={handleStartWebCall}
          disabled={!selectedAgentId || isStartingCall || isCallActive}
          variant="outline"
          className="min-w-[200px]"
        >
          {isStartingCall ? (
            <>
              <span className="inline-block animate-spin mr-2">⏳</span>
              Starting Call...
            </>
          ) : (
            <>
              <Phone className="h-4 w-4 mr-2" />
              Start Web Call
            </>
          )}
        </Button>

        <Button
          onClick={handleSaveActiveAgent}
          disabled={!selectedAgentId || isSaving || isCallActive}
          className="min-w-[200px]"
        >
          {isSaving ? (
            <>
              <span className="inline-block animate-spin mr-2">⏳</span>
              Saving...
            </>
          ) : (
            'Save Active Agent'
          )}
        </Button>
      </div>
    </div>
  )
}
