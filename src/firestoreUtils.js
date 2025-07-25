import { 
  doc, 
  setDoc, 
  onSnapshot,
  collection,
  updateDoc,
  deleteDoc,
  query,
  orderBy 
} from "firebase/firestore";
import { db } from "./firebase";

// Get user's tasks collection reference
const getUserTasksCollection = (userId) => {
  return collection(db, "users", userId, "tasks");
};

// Save tasks to Firestore for a specific user (simplified)
export const saveTasksToFirestore = async (userId) => {
  try {
    const userDocRef = doc(db, "users", userId);
    await setDoc(userDocRef, { 
      lastUpdated: new Date(),
      email: userId 
    }, { merge: true });
  } catch (error) {
    console.error("Error saving user doc to Firestore:", error);
    throw error;
  }
};

// Load tasks from Firestore for a specific user
export const loadTasksFromFirestore = async (userId) => {
  try {
    const tasksCollection = getUserTasksCollection(userId);
    const q = query(tasksCollection, orderBy("updatedAt", "desc"));
    
    return new Promise((resolve, reject) => {
      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const tasks = [];
        querySnapshot.forEach((doc) => {
          tasks.push({ id: doc.id, ...doc.data() });
        });
        resolve(tasks);
      }, reject);
      
      // Return unsubscribe function for cleanup
      return unsubscribe;
    });
  } catch (error) {
    console.error("Error loading tasks from Firestore:", error);
    return [];
  }
};

// Listen to real-time changes in user's tasks
export const subscribeToUserTasks = (userId, callback) => {
  try {
    const tasksCollection = getUserTasksCollection(userId);
    const q = query(tasksCollection, orderBy("updatedAt", "desc"));
    
    return onSnapshot(q, 
      (querySnapshot) => {
        const tasks = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          tasks.push({ 
            id: doc.id, 
            ...data,
            // Ensure we have the required fields
            title: data.title || '',
            description: data.description || '',
            status: data.status || 'todo'
          });
        });
        callback(tasks);
      },
      (error) => {
        console.error("Error in real-time listener:", error);
        // Call callback with empty array on error
        callback([]);
      }
    );
  } catch (error) {
    console.error("Error setting up real-time listener:", error);
    callback([]);
    return () => {}; // Return empty unsubscribe function
  }
};

// Add a single task to Firestore
export const addTaskToFirestore = async (userId, task) => {
  try {
    const tasksCollection = getUserTasksCollection(userId);
    const taskRef = doc(tasksCollection, task.id);
    await setDoc(taskRef, {
      ...task,
      updatedAt: new Date()
    });
  } catch (error) {
    console.error("Error adding task to Firestore:", error);
    throw error;
  }
};

// Update a single task in Firestore
export const updateTaskInFirestore = async (userId, taskId, updates) => {
  try {
    const tasksCollection = getUserTasksCollection(userId);
    const taskRef = doc(tasksCollection, taskId);
    await updateDoc(taskRef, {
      ...updates,
      updatedAt: new Date()
    });
  } catch (error) {
    console.error("Error updating task in Firestore:", error);
    throw error;
  }
};

// Delete a single task from Firestore
export const deleteTaskFromFirestore = async (userId, taskId) => {
  try {
    const tasksCollection = getUserTasksCollection(userId);
    const taskRef = doc(tasksCollection, taskId);
    await deleteDoc(taskRef);
  } catch (error) {
    console.error("Error deleting task from Firestore:", error);
    throw error;
  }
};
