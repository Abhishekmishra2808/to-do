import React, { useState, useEffect } from 'react';

const TaskDetailsModal = ({ task, isOpen, onClose, onUpdateTask }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [priority, setPriority] = useState('Medium');
  const [reminder, setReminder] = useState('');

  useEffect(() => {
    if (task) {
      setTitle(task.title || '');
      setDescription(task.description || '');
      setDueDate(task.dueDate || '');
      setPriority(task.priority || 'Medium');
      setReminder(task.reminder || '');
    }
  }, [task]);

  const handleSave = () => {
    const updatedTask = {
      ...task,
      title,
      description,
      dueDate,
      priority,
      reminder,
    };
    onUpdateTask(updatedTask);
    onClose();
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'Low': return 'text-green-400 bg-green-400/20 border-green-400/30';
      case 'Medium': return 'text-yellow-400 bg-yellow-400/20 border-yellow-400/30';
      case 'High': return 'text-orange-400 bg-orange-400/20 border-orange-400/30';
      case 'Urgent': return 'text-red-400 bg-red-400/20 border-red-400/30';
      default: return 'text-gray-400 bg-gray-400/20 border-gray-400/30';
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 transition-opacity duration-300"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-gray-900/90 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden transform transition-all duration-300 animate-modal-enter">
          
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-white/10">
            <h2 className="text-2xl font-bold text-gray-100">Task Details</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-200 transition-colors p-2 hover:bg-white/10 rounded-lg"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
            
            {/* Title */}
            <div className="mb-6">
              <label className="block text-gray-300 font-medium mb-2">Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-3 bg-gray-800/70 border border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition text-gray-100 text-lg font-medium"
                placeholder="Enter task title..."
              />
            </div>

            {/* Description */}
            <div className="mb-6">
              <label className="block text-gray-300 font-medium mb-2">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows="4"
                className="w-full px-4 py-3 bg-gray-800/70 border border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition text-gray-100 resize-none"
                placeholder="Add a detailed description..."
              />
            </div>

            {/* Priority and Due Date Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              
              {/* Priority */}
              <div>
                <label className="block text-gray-300 font-medium mb-2">Priority</label>
                <div className="relative">
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-800/70 border border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition text-gray-100 appearance-none cursor-pointer"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Urgent">Urgent</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
                {/* Priority Badge */}
                <div className="mt-2">
                  <span className={`inline-flex items-center px-3 py-1 rounded-lg text-sm font-medium border ${getPriorityColor(priority)}`}>
                    {priority} Priority
                  </span>
                </div>
              </div>

              {/* Due Date */}
              <div>
                <label className="block text-gray-300 font-medium mb-2">Due Date</label>
                <input
                  type="datetime-local"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-800/70 border border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition text-gray-100"
                />
              </div>
            </div>

            {/* Reminder */}
            <div className="mb-6">
              <label className="block text-gray-300 font-medium mb-2">Reminder</label>
              <input
                type="datetime-local"
                value={reminder}
                onChange={(e) => setReminder(e.target.value)}
                className="w-full px-4 py-3 bg-gray-800/70 border border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition text-gray-100"
              />
              <p className="text-gray-400 text-sm mt-1">Set when you want to be reminded about this task</p>
            </div>

            {/* Task Info */}
            <div className="bg-gray-800/30 border border-white/10 rounded-xl p-4 mb-6">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-400">Status:</span>
                  <span className="text-gray-200 ml-2 capitalize">{task?.status?.replace('inprogress', 'In Progress')}</span>
                </div>
                <div>
                  <span className="text-gray-400">Created:</span>
                  <span className="text-gray-200 ml-2">{new Date(task?.createdAt || Date.now()).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 p-6 border-t border-white/10 bg-gray-900/50">
            <button
              onClick={onClose}
              className="px-6 py-2.5 text-gray-300 hover:text-gray-100 hover:bg-gray-700/50 rounded-lg transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900"
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes modal-enter {
          from {
            opacity: 0;
            transform: scale(0.95) translateY(-20px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
        .animate-modal-enter {
          animation: modal-enter 0.3s ease-out forwards;
        }
      `}</style>
    </>
  );
};

export default TaskDetailsModal;
