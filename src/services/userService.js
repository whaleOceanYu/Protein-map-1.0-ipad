// src/services/userService.js

const MOCK_USER = {
  id:           1,
  name:         'Ocean',
  email:        'proteinmap2026@cuhk.edu.hk',
  age:          25,
  height:       168,
  weight:       68,
  goal:         '增肌',
  targetWeight: 75,
  dietary:      [],
};

export function getMockUser() {
  return { ...MOCK_USER };
}

// 只接受指定帳號密碼
export function mockLogin(email, password) {
  if (!email || !password) {
    return { success: false, error: '請填寫電郵和密碼' };
  }
  if (email === 'proteinmap2026@cuhk.edu.hk' && password === 'cuhk2026') {
    return { success: true, user: getMockUser() };
  }
  return { success: false, error: '電郵或密碼不正確' };
}

export function mockSignup(formData) {
  if (!formData.name || !formData.email || !formData.password) {
    return { success: false, error: '請填寫必填欄位' };
  }
  const newUser = {
    ...MOCK_USER,
    name:         formData.name              || MOCK_USER.name,
    email:        formData.email             || MOCK_USER.email,
    goal:         formData.goal              || MOCK_USER.goal,
    age:          Number(formData.age)       || MOCK_USER.age,
    height:       Number(formData.height)    || MOCK_USER.height,
    weight:       Number(formData.weight)    || MOCK_USER.weight,
    targetWeight: Number(formData.targetWeight) || MOCK_USER.targetWeight,
    dietary:      formData.dietary           || [],
  };
  return { success: true, user: newUser };
}
