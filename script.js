let schedule = {};
let currentFloor = '';

const weekdayNames = ['일', '월', '화', '수', '목', '금'];

// 월~금 모두 CSV 문자열로 데이터 저장
const csvData = {
  '월': `
시간,강의실
9:00,
9:30,
10:00,
10:30,314
10:30,411
10:30,516
11:00,314
11:00,411
11:00,516
11:30,314
11:30,411
11:30,516
12:00,516
12:30,
13:00,
13:30,414
13:30,516
14:00,414
14:00,516
14:30,414
14:30,516
15:00,516
15:30,516
16:00,516
16:30,516
17:00,
17:30,
18:00,314
18:00,516
19:00,314
19:00,516
19:30,411
19:30,516
20:00,411
20:00,516
20:30,411
20:30,414
20:30,516
21:00,
22:00,


`,
  '화': `
시간,강의실
9:00,
9:30,
10:00,
10:30,
11:00,
11:30,
12:00,314
12:30,314
13:00,411
13:00,414
13:30,411
13:30,414
14:00,324
14:00,414
14:30,314
14:30,414
15:30,314
15:30,414
15:30,516
16:00,516
16:30,
17:00,414
17:30,414
18:00,314
18:00,414
18:00,516
18:30,314
18:30,414
18:30,516
19:00,516
19:30,
20:00,
20:30,
21:00,
21:30,
,
,
,

`,
  '수': `
시간,강의실
9:00,
9:30,
10:00,
10:30,414
11:00,414
11:30,414
12:00,
12:30,
13:00,
13:30,315
13:30,516
14:00,315
14:00,516
14:30,315
14:30,516
15:00,414
15:00,516
15:30,414
16:00,414
16:30,414
17:00,516
17:30,516
18:00,315
18:30,315
19:00,315
19:30,516
20:00,516
20:30,516
21:00,516
21:30,


`,
  '목': `
시간,강의실
9:00,
9:30,
10:00,
10:30,
11:00,
11:30,
12:00,
12:30,
13:00,
13:30,411
14:00,411
14:30,
15:00,
15:30,
16:00,
16:30,
17:00,
17:30,
18:00,
18:30,
19:00,
19:30,
20:00,
20:30,
21:00,
21:30,

`,
  '금': `
시간,강의실
9:00,
9:30,
10:00,
10:30,414
11:00,414
11:30,414
12:00,411
12:30,411
13:00,411
13:30,411
14:00,411
14:00,516
14:30,411
14:30,516
15:00,414
15:00,516
15:30,414
15:30,516
16:00,414
16:00,516
16:30,414
16:30,516
17:00,414
17:00,516
17:30,414
17:30,516
18:00,516
18:30,516
19:00,516
19:30,516
20:00,516
20:30,
21:00,
21:30,
`,
};

function getCurrentTimeSlotFromDate(date) {
  const hour = date.getHours().toString().padStart(2, '0');
  const minute = date.getMinutes() < 30 ? '00' : '30';
  return `${hour}:${minute}`;
}

function updateCurrentTime() {
  const now = new Date();

  const h = now.getHours().toString().padStart(2, '0');
  const m = now.getMinutes().toString().padStart(2, '0');
  const day = weekdayNames[now.getDay()];
  const time = getCurrentTimeSlotFromDate(now);

  document.getElementById('current-time').innerText = `현재시간 : ${h}:${m} (${day}요일)`;

  loadSchedule(day).then(() => {
    showFloor(currentFloor, day, time);
  });
}

function loadSchedule(day) {
  if (!schedule[day]) schedule[day] = {};
  return new Promise((resolve) => {
    const csv = csvData[day];
    if (!csv) {
      resolve();
      return;
    }
    const lines = csv.trim().split('\n').slice(1); // 헤더 제외
    lines.forEach(line => {
      const [timeRaw, roomRaw] = line.split(',');
      const [hour, minute] = timeRaw.split(':');
      const time = `${hour.padStart(2, '0')}:${minute}`;
      const room = roomRaw.trim();

      if (!schedule[day][time]) schedule[day][time] = [];
      schedule[day][time].push(room);
    });
    resolve();
  });
}

function showFloor(floor, day, time) {
  currentFloor = floor;
  const rooms = floorMap[floor] || [];
  const occupied = (schedule[day] && schedule[day][time]) ? schedule[day][time] : [];

  const container = document.getElementById('room-container');
  container.innerHTML = '';
  rooms.forEach(room => {
    const div = document.createElement('div');
    div.className = 'room-box ' + (occupied.includes(room) ? 'occupied' : 'available');
    div.innerText = room;
    container.appendChild(div);
  });

  document.getElementById('floorDisplay').innerText = `${floor} 강의실`;
}

function handleFloorClick(floor) {
  const now = new Date();
  now.setHours(15); // 테스트용 시간 고정
  now.setMinutes(0);
  const day = weekdayNames[now.getDay()];
  const time = getCurrentTimeSlotFromDate(now);

  currentFloor = floor;

  if (schedule[day]) {
    showFloor(floor, day, time);
  } else {
    loadSchedule(day).then(() => {
      showFloor(floor, day, time);
    });
  }
}

const floorMap = {
  '3F': ['314', '315'],
  '4F': ['411', '414'],
  '5F': ['516'],
};

// 최초 실행 및 1분마다 갱신
updateCurrentTime();
setInterval(updateCurrentTime, 60000);
