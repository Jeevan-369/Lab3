import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet, Text, TextInput, View,
  FlatList, TouchableOpacity, Animated, Alert
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function App() {
  const [task, setTask] = useState('');
  const [tasks, setTasks] = useState([]);
  const [editingTaskId, setEditingTaskId] = useState(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const editAnim = useRef(new Animated.Value(1)).current;


  useEffect(() => {
    const loadTasks = async () => {
      try {
        const storedTasks = await AsyncStorage.getItem('tasks');
        if (storedTasks) {
          setTasks(JSON.parse(storedTasks));
        }
      } catch (error) {
        console.error('Error loading tasks:', error);
      }
    };

    loadTasks();
  }, []);


  const saveTasks = async (newTasks) => {
    try {
      await AsyncStorage.setItem('tasks', JSON.stringify(newTasks));
    } catch (error) {
      console.error('Error saving tasks:', error);
    }
  };

  const addTask = () => {
    if (task.trim()) {
      if (editingTaskId) {
        updateTask();
      } else {
        const newTask = { id: Date.now().toString(), text: task, isCompleted: false };
        const updatedTasks = [...tasks, newTask];
        setTasks(updatedTasks);
        saveTasks(updatedTasks);
        setTask('');
        fadeIn();
      }
    } else {
      Alert.alert('Error', 'Task cannot be empty!');
    }
  };

  const deleteTask = (taskId) => {
    fadeOut(taskId);
  };

  const fadeIn = () => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  };

  const fadeOut = (taskId) => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 500,
      useNativeDriver: true,
    }).start(() => {
      const updatedTasks = tasks.filter((item) => item.id !== taskId);
      setTasks(updatedTasks);
      saveTasks(updatedTasks);
    });
  };

  const toggleTaskCompletion = (taskId) => {
    const updatedTasks = tasks.map((item) =>
      item.id === taskId ? { ...item, isCompleted: !item.isCompleted } : item
    );
    setTasks(updatedTasks);
    saveTasks(updatedTasks);
  };

  const startEditingTask = (task) => {
    setTask(task.text);
    setEditingTaskId(task.id);
    animateEditIn();
  };

  const updateTask = () => {
    const updatedTasks = tasks.map((item) =>
      item.id === editingTaskId ? { ...item, text: task } : item
    );
    setTasks(updatedTasks);
    saveTasks(updatedTasks);
    setTask('');
    setEditingTaskId(null);
    animateEditOut();
  };

  const animateEditIn = () => {
    Animated.timing(editAnim, {
      toValue: 1.05, // Slightly scale up
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const animateEditOut = () => {
    Animated.timing(editAnim, {
      toValue: 1, // Reset to normal scale
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Simple To-Do List</Text>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Add or edit a task"
          value={task}
          onChangeText={(text) => setTask(text)}
        />
        <TouchableOpacity style={styles.addButton} onPress={addTask}>
          <Text style={styles.addButtonText}>{editingTaskId ? '✓' : '+'}</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={tasks}
        renderItem={({ item }) => (
          <Animated.View
            style={[
              styles.taskContainer,
              item.id === editingTaskId && {
                transform: [{ scale: editAnim }],
                backgroundColor: '#E0F7FA', // Highlight color during editing
              },
            ]}
          >
            <Text
              style={[
                styles.taskText,
                item.isCompleted && styles.completedTaskText,
              ]}
              onPress={() => toggleTaskCompletion(item.id)}
            >
              {item.text}
            </Text>
            <View style={styles.actions}>
              <TouchableOpacity onPress={() => startEditingTask(item)}>
                <Text style={styles.editButton}>✎</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => deleteTask(item.id)}>
                <Text style={styles.deleteButton}>✕</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        )}
        keyExtractor={(item) => item.id}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: 50,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  input: {
    flex: 1,
    height: 40,
    borderColor: '#ddd',
    borderWidth: 1,
    paddingHorizontal: 10,
    borderRadius: 5,
  },
  addButton: {
    backgroundColor: '#5C5CFF',
    height: 40,
    width: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    marginLeft: 10,
  },
  addButtonText: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  taskContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    borderBottomColor: '#ddd',
    borderBottomWidth: 1,
  },
  taskText: {
    fontSize: 16,
    color: '#333',
  },
  completedTaskText: {
    textDecorationLine: 'line-through',
    color: '#aaa',
  },
  actions: {
    flexDirection: 'row',
  },
  editButton: {
    color: '#5C5CFF',
    fontWeight: 'bold',
    fontSize: 18,
    marginRight: 10,
  },
  deleteButton: {
    color: '#FF5C5C',
    fontWeight: 'bold',
    fontSize: 18,
  },
});