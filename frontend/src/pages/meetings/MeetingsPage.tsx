import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Calendar, Clock, Plus, Check, X, Trash2, Video } from 'lucide-react'
import { Card, CardBody, CardHeader } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Badge } from '../../components/ui/Badge'
import { Avatar } from '../../components/ui/Avatar'
import { useAuth } from '../../context/useAuth'
import { meetingApi, Meeting } from '../../api/api'
import ScheduleMeetingModal from './ScheduleMeetingModal'

const statusVariant: Record<string, 'primary' | 'success' | 'error' | 'gray'> = {
  pending: 'primary',
  accepted: 'success',
  rejected: 'error',
  cancelled: 'gray',
}

export const MeetingsPage: React.FC = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [meetings, setMeetings] = useState<Meeting[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  // ── Get current user ID reliably ──────────────────────
  const currentUserId = user?.id || ''

  const fetchMeetings = () => {
    meetingApi
      .getMeetings()
      .then(({ data }) => setMeetings(data.meetings))
      .catch(console.error)
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchMeetings() }, [])

  const handleStatus = async (
    meetingId: string,
    status: 'accepted' | 'rejected' | 'cancelled'
  ) => {
    setActionLoading(meetingId + status)
    try {
      const { data } = await meetingApi.updateStatus(meetingId, status)
      setMeetings(prev => prev.map(m => m._id === meetingId ? data.meeting : m))
    } catch (err) {
      console.error(err)
    } finally {
      setActionLoading(null)
    }
  }

  const handleDelete = async (meetingId: string) => {
    if (!confirm('Delete this meeting?')) return
    try {
      await meetingApi.deleteMeeting(meetingId)
      setMeetings(prev => prev.filter(m => m._id !== meetingId))
    } catch (err) {
      console.error(err)
    }
  }

  const now = new Date()
  const upcoming = meetings.filter(
    m => new Date(m.date) >= now && m.status !== 'cancelled' && m.status !== 'rejected'
  )
  const past = meetings.filter(
    m => new Date(m.date) < now || m.status === 'cancelled' || m.status === 'rejected'
  )
  const pendingRequests = meetings.filter(
    m => m.status === 'pending' && m.scheduledWith._id === currentUserId
  )

  // ── Check if current user is the organizer ────────────
  const checkIsOrganizer = (meeting: Meeting): boolean => {
    const organizerId = meeting.scheduledBy.id || meeting.scheduledBy._id
    return organizerId === currentUserId
  }

  // ── Check if join call should be enabled ─────────────
  const isJoinable = (meetingDate: Date): boolean => {
    const diff = meetingDate.getTime() - now.getTime()
    // Allow joining 15 mins before and up to 60 mins after start
    return diff <= 15 * 60 * 1000 && diff >= -60 * 60 * 1000
  }

  const renderMeetingCard = (meeting: Meeting) => {
    const isOrganizer = checkIsOrganizer(meeting)
    const otherPerson = isOrganizer ? meeting.scheduledWith : meeting.scheduledBy
    const meetingDate = new Date(meeting.date)
    const joinable = isJoinable(meetingDate)

    return (
      <div
        key={meeting._id}
        className="flex items-start justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-start gap-4">
          <Avatar src={otherPerson.avatarUrl} alt={otherPerson.name} size="md" />
          <div>
            <h3 className="text-sm font-semibold text-gray-900">{meeting.title}</h3>
            <p className="text-sm text-gray-600 mt-0.5">
              with <span className="font-medium">{otherPerson.name}</span>
              <span className="ml-1 text-xs text-gray-400">({otherPerson.role})</span>
            </p>
            <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
              <span className="flex items-center gap-1">
                <Calendar size={12} />
                {meetingDate.toLocaleDateString('en-US', {
                  weekday: 'short', month: 'short', day: 'numeric', year: 'numeric',
                })}
              </span>
              <span className="flex items-center gap-1">
                <Clock size={12} />
                {meetingDate.toLocaleTimeString('en-US', {
                  hour: '2-digit', minute: '2-digit',
                })}
              </span>
              <span>{meeting.duration} mins</span>
            </div>
            {meeting.message && (
              <p className="text-xs text-gray-500 mt-1 italic">"{meeting.message}"</p>
            )}
            {/* Show who scheduled it */}
            <p className="text-xs text-gray-400 mt-1">
              {isOrganizer ? '📤 You scheduled this' : '📥 Scheduled by ' + otherPerson.name}
            </p>
          </div>
        </div>

        <div className="flex flex-col items-end gap-2 ml-4">
          <Badge variant={statusVariant[meeting.status]}>
            {meeting.status.charAt(0).toUpperCase() + meeting.status.slice(1)}
          </Badge>

          <div className="flex gap-1 flex-wrap justify-end">

            {/* ── Recipient only: accept/reject pending ── */}
            {!isOrganizer && meeting.status === 'pending' && (
              <>
                <Button
                  size="sm"
                  variant="outline"
                  leftIcon={<Check size={14} />}
                  onClick={() => handleStatus(meeting._id, 'accepted')}
                  disabled={!!actionLoading}
                >
                  Accept
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  leftIcon={<X size={14} />}
                  onClick={() => handleStatus(meeting._id, 'rejected')}
                  disabled={!!actionLoading}
                >
                  Reject
                </Button>
              </>
            )}

            {/* ── Organizer only: cancel pending ── */}
            {isOrganizer && meeting.status === 'pending' && (
              <Button
                size="sm"
                variant="outline"
                leftIcon={<X size={14} />}
                onClick={() => handleStatus(meeting._id, 'cancelled')}
                disabled={!!actionLoading}
              >
                Cancel
              </Button>
            )}

            {/* ── Both users: join accepted call ── */}
            {meeting.status === 'accepted' && (
              <Button
                size="sm"
                leftIcon={<Video size={14} />}
                onClick={() => joinable
                  ? navigate(`/video/${meeting._id}`)
                  : alert('Meeting is not live yet. You can join 15 minutes before the scheduled time.')
                }
              >
                Join Call
              </Button>
            )}

            {/* ── Organizer only: delete ── */}
            {isOrganizer && (
              <Button
                size="sm"
                variant="outline"
                leftIcon={<Trash2 size={14} />}
                onClick={() => handleDelete(meeting._id)}
              />
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Meetings</h1>
          <p className="text-gray-600">Schedule and manage your meetings</p>
        </div>
        <Button leftIcon={<Plus size={18} />} onClick={() => setShowModal(true)}>
          Schedule Meeting
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Upcoming', value: upcoming.length, color: 'text-primary-600' },
          { label: 'Pending Requests', value: pendingRequests.length, color: 'text-yellow-600' },
          { label: 'Total', value: meetings.length, color: 'text-gray-900' },
        ].map(({ label, value, color }) => (
          <Card key={label}>
            <CardBody className="p-4 text-center">
              <p className={`text-2xl font-bold ${color}`}>{value}</p>
              <p className="text-sm text-gray-500">{label}</p>
            </CardBody>
          </Card>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-500">Loading meetings...</div>
      ) : (
        <>
          {/* Upcoming */}
          <Card>
            <CardHeader>
              <h2 className="text-lg font-medium text-gray-900">
                Upcoming Meetings
                <span className="ml-2 text-sm text-gray-400">({upcoming.length})</span>
              </h2>
            </CardHeader>
            <CardBody className="space-y-3">
              {upcoming.length === 0
                ? <p className="text-gray-500 text-sm text-center py-6">No upcoming meetings</p>
                : upcoming.map(renderMeetingCard)
              }
            </CardBody>
          </Card>

          {/* Pending requests — only show if there are any */}
          {pendingRequests.length > 0 && (
            <Card>
              <CardHeader>
                <h2 className="text-lg font-medium text-gray-900">
                  Pending Requests
                  <span className="ml-2 text-sm text-gray-400">({pendingRequests.length})</span>
                </h2>
              </CardHeader>
              <CardBody className="space-y-3">
                {pendingRequests.map(renderMeetingCard)}
              </CardBody>
            </Card>
          )}

          {/* Past */}
          <Card>
            <CardHeader>
              <h2 className="text-lg font-medium text-gray-900">
                Past Meetings
                <span className="ml-2 text-sm text-gray-400">({past.length})</span>
              </h2>
            </CardHeader>
            <CardBody className="space-y-3">
              {past.length === 0
                ? <p className="text-gray-500 text-sm text-center py-6">No past meetings</p>
                : past.map(renderMeetingCard)
              }
            </CardBody>
          </Card>
        </>
      )}

      {showModal && (
        <ScheduleMeetingModal
          onClose={() => setShowModal(false)}
          onSuccess={newMeeting => {
            setMeetings(prev => [newMeeting, ...prev])
            setShowModal(false)
          }}
        />
      )}
    </div>
  )
}