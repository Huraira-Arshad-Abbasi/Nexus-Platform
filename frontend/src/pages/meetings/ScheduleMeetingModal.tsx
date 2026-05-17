import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { meetingApi, Meeting } from '../../api/api';
import { userApi } from '../../api/api';
import { useAuth } from '../../context/useAuth';
import { User } from '../../types';

interface Props {
  onClose: () => void;
  onSuccess: (meeting: Meeting) => void;
}

const ScheduleMeetingModal: React.FC<Props> = ({ onClose, onSuccess }) => {
  const { user } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [title, setTitle] = useState('');
  const [scheduledWith, setScheduledWith] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [duration, setDuration] = useState('30');
  const [message, setMessage] = useState('');

  // Fetch all users to pick who to meet with
  useEffect(() => {
    userApi.getAllUsers()
      .then(({ data }) => {
        // Filter out current user
        setUsers(data.users.filter((u: User) => u.id !== user?.id && u.id !== user?.id));
      })
      .catch(console.error);
  }, [user?.id]);

  const handleSubmit = async () => {
    if (!title || !scheduledWith || !date || !time) {
      setError('Please fill in all required fields');
      return;
    }

    const combinedDate = new Date(`${date}T${time}`);
    if (combinedDate <= new Date()) {
      setError('Meeting date must be in the future');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const { data } = await meetingApi.scheduleMeeting({
        title,
        scheduledWith,
        date: combinedDate.toISOString(),
        duration: parseInt(duration),
        message,
      });
      onSuccess(data.meeting);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to schedule meeting');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        {/* Modal header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Schedule Meeting</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>

        {/* Modal body */}
        <div className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-md text-sm">
              {error}
            </div>
          )}

          <Input
            label="Meeting Title *"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Investment Discussion"
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Meet With *
            </label>
            <select
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              value={scheduledWith}
              onChange={(e) => setScheduledWith(e.target.value)}
            >
              <option value="">Select a person...</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name} ({u.role})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Date *"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
            />
            <Input
              label="Time *"
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Duration</label>
            <select
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
            >
              <option value="15">15 minutes</option>
              <option value="30">30 minutes</option>
              <option value="45">45 minutes</option>
              <option value="60">1 hour</option>
              <option value="90">1.5 hours</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Message <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <textarea
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              rows={3}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="What would you like to discuss?"
            />
          </div>
        </div>

        {/* Modal footer */}
        <div className="flex justify-end gap-3 p-6 border-t border-gray-200">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? 'Scheduling...' : 'Schedule Meeting'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ScheduleMeetingModal;