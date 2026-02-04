const storageKey = 'girlypop-tasks-v1';

const daysGrid = document.getElementById('days-grid');
const monthLabel = document.getElementById('month-label');
const prevMonthButton = document.getElementById('prev-month');
const nextMonthButton = document.getElementById('next-month');
const modalBackdrop = document.getElementById('task-modal');
const modalTitle = document.getElementById('modal-title');
const modalTaskList = document.getElementById('modal-task-list');
const addTaskButton = document.getElementById('add-task');
const newTaskInput = document.getElementById('new-task-input');
const closeModalButton = document.getElementById('close-modal');

const monthNames = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

let currentMonth = new Date();
let selectedDateKey = null;

const loadTasks = () => {
  try {
    const stored = localStorage.getItem(storageKey);
    return stored ? JSON.parse(stored) : {};
  } catch (error) {
    return {};
  }
};

const saveTasks = (tasksByDate) => {
  localStorage.setItem(storageKey, JSON.stringify(tasksByDate));
};

let tasksByDate = loadTasks();

const formatDateKey = (year, month, day) => {
  const paddedMonth = String(month + 1).padStart(2, '0');
  const paddedDay = String(day).padStart(2, '0');
  return `${year}-${paddedMonth}-${paddedDay}`;
};

const formatReadableDate = (year, month, day) => {
  return `${monthNames[month]} ${day}, ${year}`;
};

const createCheckbox = (checked, onChange) => {
  const input = document.createElement('input');
  input.type = 'checkbox';
  input.className = 'checkbox';
  input.checked = checked;
  input.addEventListener('change', onChange);
  return input;
};

const calculateTotals = (tasks) => {
  return tasks.reduce(
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
};

const updateDayProgress = (dayCard, tasks) => {
  const totals = calculateTotals(tasks);
  const ratio = totals.total === 0 ? 0 : totals.done / totals.total;
  const hue = Math.round(120 * ratio);
  dayCard.style.background = `linear-gradient(135deg, hsla(${hue}, 70%, 75%, 0.8), #fff6fb)`;
  const progress = dayCard.querySelector('.day-progress');
  progress.textContent = `${totals.done}/${totals.total} sparkles done`;
};

const renderTaskPreview = (task, dayCard, dateKey) => {
  const taskItem = document.createElement('li');
  taskItem.className = 'task-item';

  const taskRow = document.createElement('div');
  taskRow.className = 'task-row';

  const taskMain = document.createElement('div');
  taskMain.className = 'task-main';

  const taskLabel = document.createElement('span');
  taskLabel.textContent = task.title;
  taskLabel.classList.toggle('completed', task.done);

  const taskCheckbox = createCheckbox(task.done, (event) => {
    event.stopPropagation();
    task.done = taskCheckbox.checked;
    taskLabel.classList.toggle('completed', task.done);
    saveTasks(tasksByDate);
    updateDayProgress(dayCard, tasksByDate[dateKey] || []);
    renderCalendar();
  });
  taskCheckbox.addEventListener('click', (event) => event.stopPropagation());

  taskMain.appendChild(taskCheckbox);
  taskMain.appendChild(taskLabel);

  const toggleButton = document.createElement('button');
  toggleButton.className = 'task-toggle';
  toggleButton.type = 'button';
  toggleButton.setAttribute('aria-expanded', 'true');
  toggleButton.textContent = 'Hide';
  toggleButton.addEventListener('click', (event) => event.stopPropagation());

  taskRow.appendChild(taskMain);
  taskRow.appendChild(toggleButton);

  const subtaskList = document.createElement('ul');
  subtaskList.className = 'subtasks';

  task.subtasks.forEach((subtask) => {
    const subtaskItem = document.createElement('li');
    subtaskItem.className = 'subtask-item';

    const subtaskLabel = document.createElement('span');
    subtaskLabel.textContent = subtask.title;
    subtaskLabel.classList.toggle('completed', subtask.done);

    const subtaskCheckbox = createCheckbox(subtask.done, (event) => {
      event.stopPropagation();
      subtask.done = subtaskCheckbox.checked;
      subtaskLabel.classList.toggle('completed', subtask.done);
      saveTasks(tasksByDate);
      renderCalendar();
    });
    subtaskCheckbox.addEventListener('click', (event) => event.stopPropagation());

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
  return taskItem;
};

const renderDay = (year, month, day) => {
  const dayCard = document.createElement('article');
  dayCard.className = 'day-card';

  const dateKey = formatDateKey(year, month, day);
  const tasks = tasksByDate[dateKey] || [];

  const header = document.createElement('div');
  header.className = 'day-header';
  header.innerHTML = `<span>🌸 ${day}</span>`;

  const progress = document.createElement('span');
  progress.className = 'day-progress';
  header.appendChild(progress);

  const taskList = document.createElement('ul');
  taskList.className = 'task-list';

  tasks.forEach((task) => {
    taskList.appendChild(renderTaskPreview(task, dayCard, dateKey));
  });

  const summary = document.createElement('p');
  summary.className = 'day-summary';
  summary.textContent = tasks.length
    ? `${tasks.length} main tasks`
    : 'Tap to add tasks ✨';

  dayCard.appendChild(header);
  dayCard.appendChild(taskList);
  dayCard.appendChild(summary);
  updateDayProgress(dayCard, tasks);

  dayCard.addEventListener('click', () => {
    openModal(dateKey, year, month, day);
  });

  return dayCard;
};

const renderPlaceholder = () => {
  const placeholder = document.createElement('article');
  placeholder.className = 'day-card placeholder';
  return placeholder;
};

const renderCalendar = () => {
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  monthLabel.textContent = `${monthNames[month]} ${year}`;
  daysGrid.innerHTML = '';

  for (let i = 0; i < firstDay; i += 1) {
    daysGrid.appendChild(renderPlaceholder());
  }

  for (let day = 1; day <= daysInMonth; day += 1) {
    daysGrid.appendChild(renderDay(year, month, day));
  }
};

const openModal = (dateKey, year, month, day) => {
  selectedDateKey = dateKey;
  modalTitle.textContent = formatReadableDate(year, month, day);
  modalBackdrop.classList.add('active');
  modalBackdrop.setAttribute('aria-hidden', 'false');
  newTaskInput.value = '';
  renderModalTasks();
};

const closeModal = () => {
  modalBackdrop.classList.remove('active');
  modalBackdrop.setAttribute('aria-hidden', 'true');
  selectedDateKey = null;
};

const renderModalTasks = () => {
  modalTaskList.innerHTML = '';
  if (!selectedDateKey) {
    return;
  }

  const tasks = tasksByDate[selectedDateKey] || [];

  tasks.forEach((task, taskIndex) => {
    const taskCard = document.createElement('div');
    taskCard.className = 'modal-task';

    const header = document.createElement('div');
    header.className = 'modal-task-header';

    const titleWrap = document.createElement('div');
    titleWrap.className = 'task-main';

    const taskCheckbox = createCheckbox(task.done, () => {
      task.done = taskCheckbox.checked;
      saveTasks(tasksByDate);
      renderModalTasks();
      renderCalendar();
    });

    const title = document.createElement('span');
    title.textContent = task.title;
    title.classList.toggle('completed', task.done);

    titleWrap.appendChild(taskCheckbox);
    titleWrap.appendChild(title);

    const deleteButton = document.createElement('button');
    deleteButton.className = 'text-button';
    deleteButton.type = 'button';
    deleteButton.textContent = 'Delete';
    deleteButton.addEventListener('click', () => {
      tasks.splice(taskIndex, 1);
      tasksByDate[selectedDateKey] = tasks;
      saveTasks(tasksByDate);
      renderModalTasks();
      renderCalendar();
    });

    header.appendChild(titleWrap);
    header.appendChild(deleteButton);

    const subtaskList = document.createElement('ul');
    subtaskList.className = 'modal-subtask-list';

    task.subtasks.forEach((subtask, subtaskIndex) => {
      const subtaskItem = document.createElement('li');
      subtaskItem.className = 'subtask-item';

      const subtaskCheckbox = createCheckbox(subtask.done, () => {
        subtask.done = subtaskCheckbox.checked;
        saveTasks(tasksByDate);
        renderModalTasks();
        renderCalendar();
      });

      const subtaskLabel = document.createElement('span');
      subtaskLabel.textContent = subtask.title;
      subtaskLabel.classList.toggle('completed', subtask.done);

      const subtaskDelete = document.createElement('button');
      subtaskDelete.className = 'text-button';
      subtaskDelete.type = 'button';
      subtaskDelete.textContent = 'Remove';
      subtaskDelete.addEventListener('click', () => {
        task.subtasks.splice(subtaskIndex, 1);
        saveTasks(tasksByDate);
        renderModalTasks();
        renderCalendar();
      });

      subtaskItem.appendChild(subtaskCheckbox);
      subtaskItem.appendChild(subtaskLabel);
      subtaskItem.appendChild(subtaskDelete);
      subtaskList.appendChild(subtaskItem);
    });

    const subtaskInputRow = document.createElement('div');
    subtaskInputRow.className = 'subtask-input-row';

    const subtaskInput = document.createElement('input');
    subtaskInput.type = 'text';
    subtaskInput.placeholder = 'Add a subtask';

    const addSubtaskButton = document.createElement('button');
    addSubtaskButton.className = 'primary-button';
    addSubtaskButton.type = 'button';
    addSubtaskButton.textContent = 'Add';
    addSubtaskButton.addEventListener('click', () => {
      const value = subtaskInput.value.trim();
      if (!value) {
        return;
      }
      task.subtasks.push({ title: value, done: false });
      subtaskInput.value = '';
      saveTasks(tasksByDate);
      renderModalTasks();
      renderCalendar();
    });

    subtaskInputRow.appendChild(subtaskInput);
    subtaskInputRow.appendChild(addSubtaskButton);

    taskCard.appendChild(header);
    taskCard.appendChild(subtaskList);
    taskCard.appendChild(subtaskInputRow);

    modalTaskList.appendChild(taskCard);
  });
};

addTaskButton.addEventListener('click', () => {
  if (!selectedDateKey) {
    return;
  }
  const value = newTaskInput.value.trim();
  if (!value) {
    return;
  }
  const tasks = tasksByDate[selectedDateKey] || [];
  tasks.push({ title: value, done: false, subtasks: [] });
  tasksByDate[selectedDateKey] = tasks;
  newTaskInput.value = '';
  saveTasks(tasksByDate);
  renderModalTasks();
  renderCalendar();
});

newTaskInput.addEventListener('keydown', (event) => {
  if (event.key === 'Enter') {
    addTaskButton.click();
  }
});

closeModalButton.addEventListener('click', closeModal);
modalBackdrop.addEventListener('click', (event) => {
  if (event.target === modalBackdrop) {
    closeModal();
  }
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') {
    closeModal();
  }
});

prevMonthButton.addEventListener('click', () => {
  currentMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1);
  renderCalendar();
});

nextMonthButton.addEventListener('click', () => {
  currentMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1);
  renderCalendar();
});

renderCalendar();
