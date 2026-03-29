import { useEffect, useState } from 'react';
import DeviceInfo from 'react-native-device-info';

const useAppUpdate = () => {
  const [updateInfo, setUpdateInfo] = useState({
    show: false,
    force: false,
  });

  const dismiss = () => {
    setUpdateInfo(prev => ({ ...prev, show: false }));
  };

  const isUpdateRequired = (current, latest) => {
    const c = current.split('.').map(Number);
    const l = latest.split('.').map(Number);

    for (let i = 0; i < l.length; i++) {
      if ((c[i] || 0) < l[i]) return true;
      if ((c[i] || 0) > l[i]) return false;
    }
    return false;
  };

  useEffect(() => {
    const checkUpdate = async () => {
      try {
        const res = await fetch('https://api.jsonbin.io/v3/b/69bf8dedaa77b81da908eb74');
        const json = await res.json();

    const data = json.record;

    const currentVersion = DeviceInfo.getVersion();

    console.log("Current:", currentVersion);
    console.log("Latest:", data.latestVersion);

    if (isUpdateRequired(currentVersion, data.latestVersion)) {
      setUpdateInfo({
        show: true,
        force: data.forceUpdate || false,
      });
    }
  } catch (e) {
    console.log("Update check failed:", e);
  }
    };

    checkUpdate();
  }, []);

  return { ...updateInfo, dismiss };
};

export default useAppUpdate;