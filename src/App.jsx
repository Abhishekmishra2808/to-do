import React, { useState, useEffect, useCallback, useRef } from 'react';

// --- Helper & Initial Data ---

const generateColorFromString = (str) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    const c = (hash & 0x00FFFFFF).toString(16).toUpperCase();
    return `#${"00000".substring(0, 6 - c.length) + c}`;
};

const initialTasks = [
    { id: 'task-1', title: 'Brainstorm new feature ideas', description: 'Think about what users might want next.', status: 'todo' },
    { id: 'task-2', title: 'Design UI mockups', description: 'Create wireframes and high-fidelity mockups in Figma.', status: 'todo' },
    { id: 'task-3', title: 'Develop the new React components', description: 'Build out the front-end components based on the designs.', status: 'inprogress' },
    { id: 'task-4', title: 'Set up API endpoints', description: 'Create the necessary backend routes for the new feature.', status: 'inprogress' },
    { id: 'task-5', title: 'Review and refactor old code', description: 'Clean up the existing codebase to improve maintainability.', status: 'done' },
];

const COLUMNS = [
    { id: 'todo', title: 'To Do', color: 'bg-red-400' },
    { id: 'inprogress', title: 'In Progress', color: 'bg-yellow-400' },
    { id: 'done', title: 'Done', color: 'bg-green-400' },
];

// --- Components ---

/**
 * Custom hook to manage the "live" animation of aurora blobs.
 */
const useLiveAurora = (count = 4) => {
    const blobsRef = useRef([]);
    const [, setTick] = useState(0);

    useEffect(() => {
        const createBlob = () => ({
            x: Math.random() * window.innerWidth,
            y: Math.random() * window.innerHeight,
            vx: (Math.random() - 0.5) * 1,
            vy: (Math.random() - 0.5) * 1,
            size: Math.random() * 250 + 350, // 350px to 600px
        });

        blobsRef.current = Array.from({ length: count }, createBlob);

        let animationFrameId;
        const animate = () => {
            blobsRef.current = blobsRef.current.map(blob => {
                let { x, y, vx, vy, size } = blob;
                x += vx;
                y += vy;

                if (x - size / 2 < 0 || x + size / 2 > window.innerWidth) vx *= -1;
                if (y - size / 2 < 0 || y + size / 2 > window.innerHeight) vy *= -1;
                
                return { ...blob, x, y, vx, vy };
            });
            setTick(tick => tick + 1);
            animationFrameId = requestAnimationFrame(animate);
        };

        animate();

        return () => {
            cancelAnimationFrame(animationFrameId);
        };
    }, [count]);

    return blobsRef.current.map((blob) => ({
        transform: `translate(${blob.x - blob.size / 2}px, ${blob.y - blob.size / 2}px)`,
        width: `${blob.size}px`,
        height: `${blob.size}px`,
    }));
};

/**
 * The live animated aurora background component for the dark theme.
 */
const AuroraBackground = () => {
    const blobStyles = useLiveAurora(4);
    const colors = ['bg-purple-500/30', 'bg-blue-500/30', 'bg-pink-500/30', 'bg-indigo-500/30'];

    return (
        <div className="fixed top-0 left-0 w-full h-full overflow-hidden -z-10 bg-gray-900">
            <div className="absolute top-0 left-0 w-full h-full bg-black/30 backdrop-blur-3xl"></div>
            {blobStyles.map((style, index) => (
                <div
                    key={index}
                    className={`absolute rounded-full filter blur-3xl transition-transform duration-1000 ease-linear ${colors[index % colors.length]}`}
                    style={style}
                ></div>
            ))}
        </div>
    );
};

const KanbanCard = ({ task, onDragStart }) => (
    <div
        draggable
        onDragStart={(e) => onDragStart(e, task.id)}
        className="bg-gray-800/50 backdrop-blur-sm p-4 rounded-xl shadow-md border border-white/10 mb-3 cursor-grab active:cursor-grabbing transition-all duration-200 hover:shadow-lg hover:scale-105 hover:bg-gray-700/60"
    >
        <div className="flex items-start justify-between">
            <p className="font-semibold text-gray-50 break-words">{task.title}</p>
            <div style={{ backgroundColor: generateColorFromString(task.title) }} className="w-3 h-3 rounded-full flex-shrink-0 ml-2 mt-1 border border-white/10"></div>
        </div>
        {task.description && <p className="text-sm text-gray-300 mt-2 break-words">{task.description}</p>}
    </div>
);

const KanbanColumn = ({ column, tasks, onDragOver, onDrop, onDragStart }) => {
    const [isHovered, setIsHovered] = useState(false);

    return (
        <div
            onDragOver={onDragOver}
            onDrop={(e) => onDrop(e, column.id)}
            onDragEnter={() => setIsHovered(true)}
            onDragLeave={() => setIsHovered(false)}
            className={`bg-black/20 backdrop-blur-md rounded-2xl p-4 transition-all duration-300 shadow-lg border border-white/10 ${isHovered ? 'bg-black/40' : ''}`}
        >
            <div className="flex items-center mb-4">
                <div className={`w-2.5 h-2.5 rounded-full mr-2 ${column.color}`}></div>
                <h2 className="font-bold text-gray-100">{column.title}</h2>
                <span className="ml-2 text-sm font-medium text-gray-300 bg-black/20 rounded-full px-2.5 py-0.5">
                    {tasks.length}
                </span>
            </div>
            <div className="h-full min-h-[200px]">
                {tasks.map(task => (
                    <KanbanCard key={task.id} task={task} onDragStart={onDragStart} />
                ))}
            </div>
        </div>
    );
};

const TaskModal = ({ isOpen, onClose, onSave }) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');

    useEffect(() => {
        if (!isOpen) {
            setTitle('');
            setDescription('');
        }
    }, [isOpen]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (title.trim()) {
            onSave({ title, description });
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 backdrop-blur-sm" onClick={onClose}>
            <div className="bg-gray-900/80 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl p-8 w-full max-w-lg transform transition-all animate-fade-in-up" onClick={e => e.stopPropagation()}>
                <h3 className="text-2xl font-bold mb-6 text-center text-gray-100">Create a New Task</h3>
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label htmlFor="taskTitle" className="block text-gray-300 font-medium mb-2">Title</label>
                        <input
                            type="text"
                            id="taskTitle"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full px-4 py-2.5 bg-gray-800/70 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition text-gray-100"
                            placeholder="e.g., Finalize quarterly report"
                            required
                            autoFocus
                        />
                    </div>
                    <div className="mb-8">
                        <label htmlFor="taskDesc" className="block text-gray-300 font-medium mb-2">Description (Optional)</label>
                        <textarea
                            id="taskDesc"
                            rows="4"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="w-full px-4 py-2 bg-gray-800/70 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition text-gray-100"
                            placeholder="Add more details about the task..."
                        ></textarea>
                    </div>
                    <div className="flex justify-end gap-4">
                        <button type="button" onClick={onClose} className="px-6 py-2 bg-gray-700/80 text-gray-200 rounded-lg hover:bg-gray-600/80 transition-colors">Cancel</button>
                        <button type="submit" className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">Add Task</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default function App() {
    const [tasks, setTasks] = useState(() => {
        try {
            const savedTasks = localStorage.getItem('kanbanTasks');
            return savedTasks ? JSON.parse(savedTasks) : initialTasks;
        } catch (error) {
            console.error("Failed to parse tasks from localStorage", error);
            return initialTasks;
        }
    });

    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        try {
            localStorage.setItem('kanbanTasks', JSON.stringify(tasks));
        } catch (error) {
            console.error("Failed to save tasks to localStorage", error);
        }
    }, [tasks]);

    useEffect(() => {
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/canvas-confetti@1.5.1/dist/confetti.browser.min.js';
        script.async = true;
        document.body.appendChild(script);
        return () => {
            document.body.removeChild(script);
        };
    }, []);
    
    const triggerConfetti = useCallback(() => {
        if (window.confetti) {
            window.confetti({
                particleCount: 200,
                spread: 100,
                origin: { y: 0.6 },
                zIndex: 1000
            });
        }
    }, []);

    const handleAddTask = (newTaskData) => {
        const newTask = {
            id: `task-${Date.now()}`,
            ...newTaskData,
            status: 'todo'
        };
        setTasks(prevTasks => [...prevTasks, newTask]);
    };

    const handleDragStart = (e, taskId) => {
        e.dataTransfer.setData('taskId', taskId);
    };

    const handleDragOver = (e) => {
        e.preventDefault();
    };



    const handleDrop = (e, newStatus) => {
        e.preventDefault();
        const taskId = e.dataTransfer.getData('taskId');
        
        setTasks(prevTasks => {
            const taskToMove = prevTasks.find(t => t.id === taskId);
            if (!taskToMove || taskToMove.status === newStatus) return prevTasks;
            if (newStatus === 'done' && taskToMove.status !== 'done') triggerConfetti();
            return prevTasks.map(t => t.id === taskId ? { ...t, status: newStatus } : t);
        });
    };

    return (
        <>
            <style>{`
                @keyframes fade-in-up {
                    from { opacity: 0; transform: translateY(20px) scale(0.95); }
                    to { opacity: 1; transform: translateY(0) scale(1); }
                }
                .animate-fade-in-up { animation: fade-in-up 0.3s ease-out forwards; }
            `}</style>
            
            <AuroraBackground />

            <div className="relative z-10 min-h-screen font-sans p-4 sm:p-6 lg:p-8">
                <main className="max-w-7xl mx-auto">
                    <header className="text-center mb-10">
                        <h1 className="text-5xl font-bold text-gray-50">Task Flow</h1>
                        <p className="text-gray-300 mt-2 text-lg">A fluid and interactive way to manage your workflow.</p>
                    </header>

                    <div className="flex justify-center mb-8">
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="bg-black/30 backdrop-blur-sm border border-white/10 text-gray-100 font-semibold py-3 px-6 rounded-xl shadow-lg hover:bg-black/50 transition-all transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-blue-400"
                        >
                            ✨ Add New Task
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {COLUMNS.map(column => (
                            <KanbanColumn
                                key={column.id}
                                column={column}
                                tasks={tasks.filter(t => t.status === column.id)}
                                onDragStart={handleDragStart}
                                onDragOver={handleDragOver}
                                onDrop={handleDrop}
                            />
                        ))}
                    </div>
                </main>
            </div>

            <TaskModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleAddTask}
            />
        </>
    );
}
