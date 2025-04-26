import React, { useState, useEffect } from 'react';
import { Calendar, Clock, TrendingUp, Video, UserPlus, AlertCircle, CheckCircle, X, Award, Zap, Bell, ArrowRight } from 'lucide-react';

const GogginsDisciplineTracker = () => {
  // Initial state with local storage persistence
  const [isSetup, setIsSetup] = useState(() => {
    const saved = localStorage.getItem('gogginsSetup');
    return saved ? JSON.parse(saved) : false;
  });
  
  const [lineToken, setLineToken] = useState(() => {
    const saved = localStorage.getItem('gogginsLineToken');
    return saved || '';
  });
  
  const [startDate, setStartDate] = useState(() => {
    const saved = localStorage.getItem('gogginsStartDate');
    return saved ? new Date(saved) : new Date();
  });
  
  const [days, setDays] = useState(() => {
    const saved = localStorage.getItem('gogginsDays');
    return saved ? JSON.parse(saved) : Array(30).fill().map((_, i) => ({
      day: i + 1,
      channel1Videos: 0,
      channel2Videos: 0,
      channel3Videos: 0,
      followersGained: 0,
      totalFollowers: 8000,
      completed: false,
      notes: ''
    }));
  });
  
  const [currentDay, setCurrentDay] = useState(() => {
    const saved = localStorage.getItem('gogginsCurrentDay');
    return saved ? parseInt(saved) : 1;
  });
  
  const [goals, setGoals] = useState(() => {
    const saved = localStorage.getItem('gogginsGoals');
    return saved ? JSON.parse(saved) : {
      channel1: 3,
      channel2: 2,
      channel3: 5,
      dailyFollowers: 3400
    };
  });
  
  const [totalDaysLeft, setTotalDaysLeft] = useState(() => {
    const saved = localStorage.getItem('gogginsDaysLeft');
    return saved ? parseInt(saved) : 23;
  });
  
  const [motivation, setMotivation] = useState(() => {
    const quotes = [
      "ความเจ็บปวดเป็นเพียงชั่วคราว แต่การยอมแพ้จะอยู่กับแกไปตลอดชีวิต!",
      "แกไม่ได้เกิดมาเพื่อเป็นคนธรรมดา แกเกิดมาเป็นนักรบ!",
      "อย่าหยุดเมื่อแกเหนื่อย หยุดเมื่อแกเสร็จ!",
      "ความทุกข์ทรมานเป็นครูที่ดีที่สุด!",
      "40% RULE - เมื่อแกคิดว่าหมดแรง แกเพิ่งใช้พลังไปแค่ 40%!",
      "STAY HARD! ไม่มีข้อแก้ตัว!"
    ];
    return quotes[Math.floor(Math.random() * quotes.length)];
  });
  
  const [notificationTimes, setNotificationTimes] = useState(() => {
    const saved = localStorage.getItem('gogginsNotifications');
    return saved ? JSON.parse(saved) : [
      {time: "04:30", message: "ตื่น! มันถึงเวลาที่จะพิชิตวันนี้แล้ว!"},
      {time: "08:00", message: "เริ่มทำคลิปหรือยัง? ไม่มีเวลาให้เสียแล้ว!"},
      {time: "12:00", message: "ครึ่งวันผ่านไป! แกทำได้กี่คลิปแล้ว? อัพเดทความคืบหน้า!"},
      {time: "18:00", message: "ใกล้จบวันแล้ว! อย่าให้วันนี้ผ่านไปโดยที่แกไม่ทำอะไรเลย!"},
      {time: "21:00", message: "อัพเดทความคืบหน้าและเตรียมพร้อมสำหรับพรุ่งนี้!"}
    ];
  });

  // Save to localStorage whenever state changes
  useEffect(() => {
    localStorage.setItem('gogginsSetup', JSON.stringify(isSetup));
    localStorage.setItem('gogginsLineToken', lineToken);
    localStorage.setItem('gogginsStartDate', startDate.toString());
    localStorage.setItem('gogginsDays', JSON.stringify(days));
    localStorage.setItem('gogginsCurrentDay', currentDay.toString());
    localStorage.setItem('gogginsGoals', JSON.stringify(goals));
    localStorage.setItem('gogginsDaysLeft', totalDaysLeft.toString());
    localStorage.setItem('gogginsNotifications', JSON.stringify(notificationTimes));
  }, [isSetup, lineToken, startDate, days, currentDay, goals, totalDaysLeft, notificationTimes]);

  // Check for notifications every minute
  useEffect(() => {
    const checkNotifications = () => {
      const now = new Date();
      const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
      
      notificationTimes.forEach(notification => {
        if (notification.time === currentTime && isSetup) {
          sendLineNotification(notification.message);
        }
      });
    };
    
    const interval = setInterval(checkNotifications, 60000); // check every minute
    return () => clearInterval(interval);
  }, [notificationTimes, isSetup]);

  // Send notification to LINE
  const sendLineNotification = async (message) => {
    if (!lineToken) return;
    
    try {
      const response = await fetch('https://notify-api.line.me/api/notify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Bearer ${lineToken}`
        },
        body: `message=${encodeURIComponent(message)}`
      });
      
      // Note: In a real app, this would work, but in this demo environment 
      // we can't actually send LINE notifications due to CORS restrictions
      console.log("Notification sent to LINE");
    } catch (error) {
      console.error("Error sending LINE notification:", error);
    }
  };

  // Update the current day's progress
  const updateDayProgress = (field, value) => {
    const updatedDays = [...days];
    updatedDays[currentDay - 1][field] = value;
    
    // Calculate if day is complete
    const day = updatedDays[currentDay - 1];
    const isComplete = 
      day.channel1Videos >= goals.channel1 && 
      day.channel2Videos >= goals.channel2 && 
      day.channel3Videos >= goals.channel3 && 
      day.followersGained >= goals.dailyFollowers;
    
    updatedDays[currentDay - 1].completed = isComplete;
    
    // Update total followers
    if (field === 'followersGained') {
      const previousFollowers = currentDay > 1 ? updatedDays[currentDay - 2].totalFollowers : 8000;
      updatedDays[currentDay - 1].totalFollowers = previousFollowers + value;
    }
    
    setDays(updatedDays);
    
    // Send notification if day is complete
    if (isComplete) {
      sendLineNotification(`MISSION COMPLETE DAY ${currentDay}! STAY HARD! แกทำสำเร็จแล้ว! เตรียมพร้อมสำหรับพรุ่งนี้!`);
    }
  };

  // Complete current day and move to next
  const completeDay = () => {
    if (currentDay < totalDaysLeft) {
      setCurrentDay(currentDay + 1);
      setMotivation(getRandomMotivation());
      sendLineNotification(`DAY ${currentDay} COMPLETE! เตรียมพร้อมสำหรับวันที่ ${currentDay + 1}! STAY HARD!`);
    }
  };

  // Get random motivation quote
  const getRandomMotivation = () => {
    const quotes = [
      "ความเจ็บปวดเป็นเพียงชั่วคราว แต่การยอมแพ้จะอยู่กับแกไปตลอดชีวิต!",
      "แกไม่ได้เกิดมาเพื่อเป็นคนธรรมดา แกเกิดมาเป็นนักรบ!",
      "อย่าหยุดเมื่อแกเหนื่อย หยุดเมื่อแกเสร็จ!",
      "ความทุกข์ทรมานเป็นครูที่ดีที่สุด!",
      "40% RULE - เมื่อแกคิดว่าหมดแรง แกเพิ่งใช้พลังไปแค่ 40%!",
      "STAY HARD! ไม่มีข้อแก้ตัว!"
    ];
    return quotes[Math.floor(Math.random() * quotes.length)];
  };

  // Complete setup
  const completeSetup = () => {
    if (!lineToken) {
      alert("โปรดกรอก LINE Notify Token!");
      return;
    }
    
    setIsSetup(true);
    sendLineNotification("GOGGINS DISCIPLINE TRACKER พร้อมแล้ว! เริ่มภารกิจ!");
  };

  // Calculate streak and stats
  const calculateStats = () => {
    let completedDays = 0;
    let streak = 0;
    let currentStreak = 0;
    let totalVideos = 0;
    let totalFollowersGained = 0;
    
    days.forEach((day, index) => {
      if (index >= currentDay) return;
      
      if (day.completed) {
        completedDays++;
        currentStreak++;
        if (currentStreak > streak) streak = currentStreak;
      } else {
        currentStreak = 0;
      }
      
      totalVideos += day.channel1Videos + day.channel2Videos + day.channel3Videos;
      totalFollowersGained += day.followersGained;
    });
    
    const latestTotalFollowers = days[currentDay - 1]?.totalFollowers || 8000;
    
    return {
      completedDays,
      streak,
      totalVideos,
      totalFollowersGained,
      latestTotalFollowers
    };
  };

  const stats = calculateStats();
  const currentDayData = days[currentDay - 1] || {
    channel1Videos: 0,
    channel2Videos: 0,
    channel3Videos: 0,
    followersGained: 0,
    notes: ''
  };
  
  // Remaining to goal calculation
  const calculateRemainingToGoal = () => {
    const remainingFollowers = 100000 - stats.latestTotalFollowers;
    const remainingDays = totalDaysLeft - currentDay + 1;
    const dailyFollowersNeeded = Math.ceil(remainingFollowers / remainingDays);
    
    return {
      remainingFollowers,
      remainingDays,
      dailyFollowersNeeded
    };
  };
  
  const remaining = calculateRemainingToGoal();

  // Render setup screen
  if (!isSetup) {
    return (
      <div className="min-h-screen bg-black text-white p-6 flex flex-col items-center">
        <h1 className="text-3xl font-bold mb-8 text-red-600">GOGGINS DISCIPLINE TRACKER</h1>
        
        <div className="w-full max-w-md bg-gray-900 p-6 rounded-lg shadow-lg">
          <h2 className="text-xl font-bold mb-4 flex items-center">
            <Bell className="mr-2" size={20} />
            LINE Notification Setup
          </h2>
          
          <div className="mb-4">
            <label className="block mb-2">กรอก LINE Notify Token:</label>
            <input 
              type="text" 
              value={lineToken} 
              onChange={(e) => setLineToken(e.target.value)}
              className="w-full p-2 bg-gray-800 rounded border border-gray-700"
              placeholder="LINE Notify Token"
            />
            <p className="text-xs mt-1 text-gray-400">
              *เพื่อรับการแจ้งเตือน (คุณสามารถสร้าง token ได้ที่ LINE Notify)
            </p>
          </div>
          
          <div className="mb-4">
            <h3 className="font-bold mb-2 flex items-center">
              <Calendar className="mr-2" size={18} />
              จำนวนวันที่เหลือ:
            </h3>
            <input 
              type="number" 
              value={totalDaysLeft}
              onChange={(e) => setTotalDaysLeft(parseInt(e.target.value) || 23)}
              className="w-full p-2 bg-gray-800 rounded border border-gray-700"
              min="1"
              max="30"
            />
          </div>
          
          <div className="mb-6">
            <h3 className="font-bold mb-2">เป้าหมายประจำวัน:</h3>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-sm">คลิป ช่อง 1:</label>
                <input 
                  type="number" 
                  value={goals.channel1}
                  onChange={(e) => setGoals({...goals, channel1: parseInt(e.target.value) || 0})}
                  className="w-full p-2 bg-gray-800 rounded border border-gray-700"
                  min="0"
                />
              </div>
              <div>
                <label className="text-sm">คลิป ช่อง 2:</label>
                <input 
                  type="number" 
                  value={goals.channel2}
                  onChange={(e) => setGoals({...goals, channel2: parseInt(e.target.value) || 0})}
                  className="w-full p-2 bg-gray-800 rounded border border-gray-700"
                  min="0"
                />
              </div>
              <div>
                <label className="text-sm">คลิป ช่อง 3:</label>
                <input 
                  type="number" 
                  value={goals.channel3}
                  onChange={(e) => setGoals({...goals, channel3: parseInt(e.target.value) || 0})}
                  className="w-full p-2 bg-gray-800 rounded border border-gray-700"
                  min="0"
                />
              </div>
              <div>
                <label className="text-sm">ผู้ติดตามวันละ:</label>
                <input 
                  type="number" 
                  value={goals.dailyFollowers}
                  onChange={(e) => setGoals({...goals, dailyFollowers: parseInt(e.target.value) || 0})}
                  className="w-full p-2 bg-gray-800 rounded border border-gray-700"
                  min="0"
                />
              </div>
            </div>
          </div>

          <button 
            onClick={completeSetup}
            className="w-full py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded flex items-center justify-center"
          >
            <Zap className="mr-2" size={20} />
            เริ่มภารกิจ GOGGINS!
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-4">
      <header className="mb-6 border-b border-gray-800 pb-4">
        <h1 className="text-3xl font-bold text-red-600 mb-2">GOGGINS DISCIPLINE TRACKER</h1>
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <Calendar className="mr-1" size={18} />
            <span className="mr-4">DAY {currentDay}/{totalDaysLeft}</span>
            <Clock className="mr-1" size={18} />
            <span>{new Date().toLocaleDateString()}</span>
          </div>
          <div className="flex items-center">
            <UserPlus className="mr-1" size={18} />
            <span className="font-bold text-green-500">{stats.latestTotalFollowers.toLocaleString()} FOLLOWERS</span>
          </div>
        </div>
      </header>

      <div className="bg-gray-900 p-4 rounded-lg mb-6">
        <h2 className="text-xl font-bold mb-4 text-center">{motivation}</h2>
        
        <div className="bg-red-900 p-3 rounded mb-4">
          <h3 className="font-bold mb-2 flex items-center">
            <AlertCircle className="mr-2" size={18} />
            MISSION OBJECTIVES:
          </h3>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="flex justify-between bg-gray-800 p-2 rounded">
              <span>ช่อง 1:</span>
              <span className={currentDayData.channel1Videos >= goals.channel1 ? "text-green-500 font-bold" : ""}>
                {currentDayData.channel1Videos}/{goals.channel1} คลิป
              </span>
            </div>
            <div className="flex justify-between bg-gray-800 p-2 rounded">
              <span>ช่อง 2:</span>
              <span className={currentDayData.channel2Videos >= goals.channel2 ? "text-green-500 font-bold" : ""}>
                {currentDayData.channel2Videos}/{goals.channel2} คลิป
              </span>
            </div>
            <div className="flex justify-between bg-gray-800 p-2 rounded">
              <span>ช่อง 3:</span>
              <span className={currentDayData.channel3Videos >= goals.channel3 ? "text-green-500 font-bold" : ""}>
                {currentDayData.channel3Videos}/{goals.channel3} คลิป
              </span>
            </div>
            <div className="flex justify-between bg-gray-800 p-2 rounded">
              <span>ผู้ติดตาม:</span>
              <span className={currentDayData.followersGained >= goals.dailyFollowers ? "text-green-500 font-bold" : ""}>
                {currentDayData.followersGained}/{goals.dailyFollowers}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-6">
        <div className="bg-gray-900 p-4 rounded-lg">
          <h3 className="font-bold mb-3 flex items-center">
            <Video className="mr-2" size={18} />
            อัพเดทความคืบหน้าวันนี้
          </h3>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm mb-1">คลิปช่อง 1:</label>
              <input 
                type="number" 
                value={currentDayData.channel1Videos}
                onChange={(e) => updateDayProgress('channel1Videos', parseInt(e.target.value) || 0)}
                className="w-full p-2 bg-gray-800 rounded border border-gray-700"
                min="0"
              />
            </div>
            <div>
              <label className="block text-sm mb-1">คลิปช่อง 2:</label>
              <input 
                type="number" 
                value={currentDayData.channel2Videos}
                onChange={(e) => updateDayProgress('channel2Videos', parseInt(e.target.value) || 0)}
                className="w-full p-2 bg-gray-800 rounded border border-gray-700"
                min="0"
              />
            </div>
            <div>
              <label className="block text-sm mb-1">คลิปช่อง 3:</label>
              <input 
                type="number" 
                value={currentDayData.channel3Videos}
                onChange={(e) => updateDayProgress('channel3Videos', parseInt(e.target.value) || 0)}
                className="w-full p-2 bg-gray-800 rounded border border-gray-700"
                min="0"
              />
            </div>
            <div>
              <label className="block text-sm mb-1">ผู้ติดตามเพิ่ม:</label>
              <input 
                type="number" 
                value={currentDayData.followersGained}
                onChange={(e) => updateDayProgress('followersGained', parseInt(e.target.value) || 0)}
                className="w-full p-2 bg-gray-800 rounded border border-gray-700"
                min="0"
              />
            </div>
          </div>
          
          <div className="mt-4">
            <label className="block text-sm mb-1">บันทึกประจำวัน:</label>
            <textarea 
              value={currentDayData.notes}
              onChange={(e) => updateDayProgress('notes', e.target.value)}
              className="w-full p-2 bg-gray-800 rounded border border-gray-700 h-24"
              placeholder="บันทึกความรู้สึก อุปสรรค หรือชัยชนะของวันนี้..."
            />
          </div>
          
          <button 
            onClick={completeDay}
            disabled={!currentDayData.completed}
            className={`w-full mt-4 py-3 ${currentDayData.completed ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-700 cursor-not-allowed'} text-white font-bold rounded flex items-center justify-center`}
          >
            <CheckCircle className="mr-2" size={18} />
            {currentDayData.completed ? 'จบวันนี้ ไปวันต่อไป!' : 'ทำภารกิจให้ครบก่อน!'}
          </button>
        </div>
        
        <div>
          <div className="bg-gray-900 p-4 rounded-lg mb-6">
            <h3 className="font-bold mb-3 flex items-center">
              <TrendingUp className="mr-2" size={18} />
              สถิติการเอาชนะตัวเอง
            </h3>
            
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="bg-gray-800 p-3 rounded text-center">
                <p className="text-gray-400 mb-1">Streak</p>
                <p className="text-2xl font-bold">{stats.streak} วัน</p>
              </div>
              <div className="bg-gray-800 p-3 rounded text-center">
                <p className="text-gray-400 mb-1">วันที่สำเร็จ</p>
                <p className="text-2xl font-bold">{stats.completedDays} วัน</p>
              </div>
              <div className="bg-gray-800 p-3 rounded text-center">
                <p className="text-gray-400 mb-1">คลิปทั้งหมด</p>
                <p className="text-2xl font-bold">{stats.totalVideos}</p>
              </div>
              <div className="bg-gray-800 p-3 rounded text-center">
                <p className="text-gray-400 mb-1">ผู้ติดตามเพิ่ม</p>
                <p className="text-2xl font-bold">{stats.totalFollowersGained}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-900 p-4 rounded-lg">
            <h3 className="font-bold mb-3 flex items-center">
              <Award className="mr-2" size={18} />
              MISSION TRACKER
            </h3>
            
            <div className="bg-red-900 mb-3 p-3 rounded">
              <div className="flex justify-between">
                <span>เป้าหมาย:</span>
                <span className="font-bold">100,000 FOLLOWERS</span>
              </div>
              <div className="flex justify-between">
                <span>คงเหลือ:</span>
                <span className="font-bold">{remaining.remainingFollowers.toLocaleString()} FOLLOWERS</span>
              </div>
              <div className="flex justify-between">
                <span>เหลืออีก:</span>
                <span className="font-bold">{remaining.remainingDays} วัน</span>
              </div>
              <div className="flex justify-between">
                <span>ต้องได้วันละ:</span>
                <span className="font-bold text-yellow-400">{remaining.dailyFollowersNeeded.toLocaleString()} FOLLOWERS</span>
              </div>
            </div>
            
            <div className="bg-gray-800 p-3 rounded">
              <div className="w-full bg-gray-700 rounded-full h-4">
                <div 
                  className="bg-red-600 h-4 rounded-full"
                  style={{ width: `${Math.min(100, (stats.latestTotalFollowers / 100000) * 100)}%` }}
                ></div>
              </div>
              <div className="flex justify-between mt-1 text-sm">
                <span>{stats.latestTotalFollowers.toLocaleString()}</span>
                <span>100,000</span>
              </div>
              <p className="text-center mt-2">
                {Math.floor((stats.latestTotalFollowers / 100000) * 100)}% ของเป้าหมาย
              </p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="bg-gray-900 p-4 rounded-lg mb-6">
        <h3 className="font-bold mb-3">History Log</h3>
        <div className="max-h-36 overflow-y-auto">
          {days.map((day, index) => {
            if (index >= currentDay) return null;
            return (
              <div key={index} className="flex items-center mb-2 text-sm">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center mr-2 ${day.completed ? 'bg-green-600' : 'bg-red-600'}`}>
                  {day.completed ? <CheckCircle size={14} /> : <X size={14} />}
                </div>
                <div>
                  <span className="mr-2">วันที่ {day.day}:</span>
                  <span className="text-gray-400">
                    {day.channel1Videos + day.channel2Videos + day.channel3Videos} คลิป, 
                    {day.followersGained} ผู้ติดตาม
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      
      <footer className="text-center text-sm text-gray-500 mt-8">
        <p>STAY HARD! ไม่มีข้อแก้ตัว!</p>
        <p className="mt-1">ทำตามแผน GOGGINS หรือยอมรับความล้มเหลว - เลือกเอา!</p>
      </footer>
    </div>
  );
};

export default GogginsDisciplineTracker;
