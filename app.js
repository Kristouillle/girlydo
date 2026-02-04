const days = [
  {
    day: 1,
    label: 'Sun',
    mood: '✨',
    tasks: [
      {
        title: 'Morning glam routine',
        done: false,
        subtasks: [
          { title: 'Sheet mask moment', done: false },
          { title: 'Journal three wins', done: false },
        ],
      },
      {
        title: 'Plan the week outfits',
        done: false,
        subtasks: [
          { title: 'Pick color palette', done: false },
          { title: 'Steam pink blazer', done: false },
        ],
      },
    ],
  },
  {
    day: 2,
    label: 'Mon',
    mood: '🌸',
    tasks: [
      {
        title: 'Client sparkle check-in',
        done: false,
        subtasks: [
          { title: 'Send hello email', done: false },
          { title: 'Update mood board', done: false },
        ],
      },
      {
        title: 'Water + vitamins',
        done: false,
        subtasks: [
          { title: 'Refill bottle', done: false },
        ],
      },
    ],
  },
  {
    day: 3,
    label: 'Tue',
    mood: '🧁',
    tasks: [
      {
        title: 'Creative studio sprint',
        done: false,
        subtasks: [
          { title: 'Mood playlist on', done: false },
          { title: 'Design hero card', done: false },
          { title: 'Save cute icons', done: false },
        ],
      },
    ],
  },
  {
    day: 4,
    label: 'Wed',
    mood: '🌙',
    tasks: [
      {
        title: 'Pilates + stretch',
        done: false,
        subtasks: [
          { title: 'Pack lavender mat', done: false },
          { title: 'Post-class smoothie', done: false },
        ],
      },
      {
        title: 'Inbox sparkle sweep',
        done: false,
        subtasks: [
          { title: 'Reply to three emails', done: false },
          { title: 'Archive old threads', done: false },
        ],
      },
    ],
  },
  {
    day: 5,
    label: 'Thu',
    mood: '🎀',
    tasks: [
      {
        title: 'Content calendar glow-up',
        done: false,
        subtasks: [
          { title: 'Write 2 captions', done: false },
          { title: 'Schedule stories', done: false },
        ],
      },
    ],
  },
  {
    day: 6,
    label: 'Fri',
    mood: '🍓',
    tasks: [
      {
        title: 'Team coffee catch-up',
        done: false,
        subtasks: [
          { title: 'Pick pastel cafe', done: false },
          { title: 'Share wins', done: false },
        ],
      },
      {
        title: 'Manifest board update',
        done: false,
        subtasks: [
          { title: 'Print 3 inspo pics', done: false },
        ],
      },
    ],
  },
  {
    day: 7,
    label: 'Sat',
    mood: '🩰',
    tasks: [
      {
        title: 'Self-care reset',
        done: false,
        subtasks: [
          { title: 'Bubble bath', done: false },
          { title: 'Paint nails', done: false },
          { title: 'Glow playlist', done: false },
        ],
      },
    ],
  },
];

const daysGrid = document.getElementById('days-grid');

const createCheckbox = (checked, onChange) => {
  const input = document.createElement('input');
  input.type = 'checkbox';
  input.className = 'checkbox';
  input.checked = checked;
  input.addEventListener('change', onChange);
  return input;
};

const updateDayProgress = (dayCard, dayData) => {
  const totals = dayData.tasks.reduce(
    (acc, task) => {
      acc.total += 1 + task.subtasks.length;
      acc.done += task.done ? 1 : 0;
      task.subtasks.forEach((subtask) => {
        acc.done += subtask.done ? 1 : 0;
      });
      return acc;
    },
    { total: 0, done: 0 }
  );

  const ratio = totals.total === 0 ? 0 : totals.done / totals.total;
  const hue = Math.round(120 * ratio);
  dayCard.style.background = `linear-gradient(135deg, hsla(${hue}, 70%, 75%, 0.8), #fff6fb)`;
  const progress = dayCard.querySelector('.day-progress');
  progress.textContent = `${totals.done}/${totals.total} sparkles done`;
};

const renderDay = (dayData) => {
  const dayCard = document.createElement('article');
  dayCard.className = 'day-card';

  const header = document.createElement('div');
  header.className = 'day-header';
  header.innerHTML = `<span>${dayData.mood} Day ${dayData.day}</span>`;

  const progress = document.createElement('span');
  progress.className = 'day-progress';
  header.appendChild(progress);

  const taskList = document.createElement('ul');
  taskList.className = 'task-list';

  dayData.tasks.forEach((task) => {
    const taskItem = document.createElement('li');
    taskItem.className = 'task-item';

    const taskRow = document.createElement('div');
    taskRow.className = 'task-row';

    const taskMain = document.createElement('div');
    taskMain.className = 'task-main';

    const taskLabel = document.createElement('span');
    taskLabel.textContent = task.title;

    const taskCheckbox = createCheckbox(task.done, () => {
      task.done = taskCheckbox.checked;
      taskLabel.classList.toggle('completed', task.done);
      updateDayProgress(dayCard, dayData);
    });

    taskMain.appendChild(taskCheckbox);
    taskMain.appendChild(taskLabel);

    const toggleButton = document.createElement('button');
    toggleButton.className = 'task-toggle';
    toggleButton.type = 'button';
    toggleButton.setAttribute('aria-expanded', 'true');
    toggleButton.textContent = 'Hide';

    taskRow.appendChild(taskMain);
    taskRow.appendChild(toggleButton);

    const subtaskList = document.createElement('ul');
    subtaskList.className = 'subtasks';

    task.subtasks.forEach((subtask) => {
      const subtaskItem = document.createElement('li');
      subtaskItem.className = 'subtask-item';

      const subtaskLabel = document.createElement('span');
      subtaskLabel.textContent = subtask.title;

      const subtaskCheckbox = createCheckbox(subtask.done, () => {
        subtask.done = subtaskCheckbox.checked;
        subtaskLabel.classList.toggle('completed', subtask.done);
        updateDayProgress(dayCard, dayData);
      });

      subtaskItem.appendChild(subtaskCheckbox);
      subtaskItem.appendChild(subtaskLabel);
      subtaskList.appendChild(subtaskItem);
    });

    toggleButton.addEventListener('click', () => {
      const isHidden = subtaskList.classList.toggle('hidden');
      toggleButton.textContent = isHidden ? 'Show' : 'Hide';
      toggleButton.setAttribute('aria-expanded', (!isHidden).toString());
    });

    taskItem.appendChild(taskRow);
    taskItem.appendChild(subtaskList);
    taskList.appendChild(taskItem);
  });

  dayCard.appendChild(header);
  dayCard.appendChild(taskList);
  updateDayProgress(dayCard, dayData);
  return dayCard;
};

const renderCalendar = () => {
  daysGrid.innerHTML = '';
  days.forEach((dayData) => {
    daysGrid.appendChild(renderDay(dayData));
  });
};

renderCalendar();
