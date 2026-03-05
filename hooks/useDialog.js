import { useState, useCallback } from 'react';

/**
 * 对话框状态管理 Hook
 * 封装对话框的显示/隐藏逻辑，支持多种对话框类型
 * @param {Array} dialogTypes - 对话框类型数组，如 ['add', 'edit', 'delete', 'alert']
 * @returns {Object} 对话框相关的状态和方法
 */
const useDialog = (dialogTypes = []) => {
  // 使用单个状态对象管理所有对话框，减少渲染次数
  const [dialogs, setDialogs] = useState(() => {
    const initialState = { alertMessage: '' };
    dialogTypes.forEach(type => {
      initialState[type] = false;
    });
    return initialState;
  });

  // 显示对话框
  const showDialog = useCallback((type) => {
    setDialogs(prev => ({ ...prev, [type]: true }));
  }, []);

  // 隐藏对话框
  const hideDialog = useCallback((type) => {
    setDialogs(prev => ({ ...prev, [type]: false }));
  }, []);

  // 显示提示对话框（带消息）
  const showAlert = useCallback((message) => {
    setDialogs(prev => ({ ...prev, alert: true, alertMessage: message }));
  }, []);

  // 隐藏提示对话框
  const hideAlert = useCallback(() => {
    setDialogs(prev => ({ ...prev, alert: false, alertMessage: '' }));
  }, []);

  // 切换对话框显示状态
  const toggleDialog = useCallback((type) => {
    setDialogs(prev => ({ ...prev, [type]: !prev[type] }));
  }, []);

  return {
    dialogs,
    showDialog,
    hideDialog,
    showAlert,
    hideAlert,
    toggleDialog,
    alertMessage: dialogs.alertMessage,
  };
};

export default useDialog;
