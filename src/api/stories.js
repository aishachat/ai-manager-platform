// API для управления сторис (контент для всех пользователей)

// Пример данных сторис
const defaultStories = [
  {
    id: 1,
    title: "Возможности Adapto",
    description: "Узнайте о всех возможностях нашей платформы",
    image: "/Frame 126.png",
    type: "feature",
    order: 1,
    isActive: true,
    createdAt: new Date().toISOString()
  },
  {
    id: 2,
    title: "Обзор платформы",
    description: "Полный обзор функционала Adapto",
    image: "/Frame 127.png", 
    type: "overview",
    order: 2,
    isActive: true,
    createdAt: new Date().toISOString()
  },
  {
    id: 3,
    title: "История Adapto",
    description: "Как мы создавали платформу",
    image: "/Frame 128.png",
    type: "story",
    order: 3,
    isActive: true,
    createdAt: new Date().toISOString()
  },
  {
    id: 4,
    title: "Техническая поддержка",
    description: "Как получить помощь",
    image: "/Frame 129.png",
    type: "support",
    order: 4,
    isActive: true,
    createdAt: new Date().toISOString()
  },
  {
    id: 5,
    title: "Наш тг-канал",
    description: "Подписывайтесь на новости",
    image: "/Frame 130.png",
    type: "social",
    order: 5,
    isActive: true,
    createdAt: new Date().toISOString()
  }
];

// Получить все активные сторис
export const getStories = async () => {
  try {
    // В будущем здесь будет запрос к Supabase
    // const { data, error } = await supabase
    //   .from('stories')
    //   .select('*')
    //   .eq('isActive', true)
    //   .order('order', { ascending: true });
    
    // Пока возвращаем дефолтные данные
    return defaultStories;
  } catch (error) {
    console.error('Error fetching stories:', error);
    return defaultStories;
  }
};

// Получить все сторис (включая неактивные)
export const getAllStories = async () => {
  try {
    // В будущем здесь будет запрос к Supabase
    return defaultStories;
  } catch (error) {
    console.error('Error fetching all stories:', error);
    return defaultStories;
  }
};

// Добавить новую сторис
export const addStory = async (storyData) => {
  try {
    // В будущем здесь будет запрос к Supabase
    // const { data, error } = await supabase
    //   .from('stories')
    //   .insert([storyData])
    //   .select();
    
    console.log('Story added:', storyData);
    return { success: true, data: storyData };
  } catch (error) {
    console.error('Error adding story:', error);
    return { success: false, error: error.message };
  }
};

// Обновить сторис
export const updateStory = async (id, storyData) => {
  try {
    // В будущем здесь будет запрос к Supabase
    // const { data, error } = await supabase
    //   .from('stories')
    //   .update(storyData)
    //   .eq('id', id)
    //   .select();
    
    console.log('Story updated:', id, storyData);
    return { success: true, data: storyData };
  } catch (error) {
    console.error('Error updating story:', error);
    return { success: false, error: error.message };
  }
};

// Удалить сторис
export const deleteStory = async (id) => {
  try {
    // В будущем здесь будет запрос к Supabase
    // const { data, error } = await supabase
    //   .from('stories')
    //   .delete()
    //   .eq('id', id);
    
    console.log('Story deleted:', id);
    return { success: true };
  } catch (error) {
    console.error('Error deleting story:', error);
    return { success: false, error: error.message };
  }
};

