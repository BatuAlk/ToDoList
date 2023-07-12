const addTask = () => {
	const addBtn = document.querySelector('.add-btn');
	const input = document.querySelector('#add-task');
	const todoList = document.querySelector('.todo-items');
	const taskName = input.value;
	if (taskName === "") {
		document.getElementById("error").play();
		alert("Please enter a task name!");
		return;
	} else if (containsTask(taskName, todoList.getElementsByTagName('span'))) {
		document.getElementById("error").play();
		alert("Task already exists!");
		return;
	} else {
		const newTask = document.createElement('li');
		newTask.draggable = true;
		newTask.id = 'todo-task' + todoList.children.length;
		newTask.addEventListener('dragstart', dragStart, false);
		newTask.innerHTML = `<span class="task-name">${taskName}</span><button class="edit" onclick="editTask('.todo-items')">Edit</button><button class="remove" onclick="removeTask('.todo-items')">Remove</button>`;
		todoList.appendChild(newTask);
		input.value = '';
		storeTasks();
	}
};

const listType = (itemList) => {
	if (itemList === 'todo-items') {
		return 'todo';
	} else if (itemList === 'progress-items') {
		return 'progress';
	} else if (itemList === 'done-items') {
		return 'done';
	} else {
		alert("Item list not found!");
		return;
	}
}

const removeTask = (itemList) => {
	const list = document.querySelector(itemList);
    const removeItem = (e) => {
        if (e.target.classList.contains('remove')) {
			const li = e.target.parentElement;
            list.removeChild(li);
			list.removeEventListener('click', removeItem);
			storeTasks();
		}
    };
	list.addEventListener('click', removeItem);
}

const editTask = (itemList) => {
	const list = document.querySelector(itemList);
	let edited = false;
	const editItem = (e) => {
		if (!edited) {
			if (e.target.classList.contains('edit')) {
				const li = e.target.parentElement;
				const span = li.children[0];
				const newTaskName = prompt("Enter new task name:");
				if (newTaskName === null) {
					newTaskName = span.innerHTML;
					storeTasks();
					return;
				}
				if (newTaskName === "") {
					document.getElementById("error").play();
					alert("Please enter a task name!");
					list.removeEventListener('click', editItem);
					return;
				} else if (containsTask(newTaskName, list.getElementsByTagName('span'))) {
					document.getElementById("error").play();
					alert("Task already exists!");
					list.removeEventListener('click', editItem);
					return;
				} else {
					span.innerHTML = newTaskName;
					edited = true;
					storeTasks();
					return;
				}
			}
		}
	};
	list.addEventListener('click', editItem);
}

const dragStart = (e) => {
	const value = e.target.children[0].innerHTML;	
	const itemList = e.target.children[0].parentElement.parentElement.className;
	const data = {
		"value": value,
		"itemList": itemList
	}
	e.dataTransfer.setData('data', JSON.stringify(data));
};

const allowDrop = (e) => {
	e.preventDefault();
};

const containsTask = (taskName, taskList) => {
	for (let i = 0; i < taskList.length; i++) {
		if (taskList[i].innerHTML === taskName) {
			return true;
		}
	}
	return false;
}

const findIndex = (taskName, taskList) => {
	for (let i = 0; i < taskList.length; i++) {
		if (taskList[i].innerHTML.includes(taskName)) {
			return i;
		}
	}
	return -1;
}

const drop = (e) => {
	e.preventDefault();
	const data = JSON.parse(e.dataTransfer.getData('data'));
	const target = e.target;
	if (containsTask(data["value"], target.getElementsByTagName('span'))) {
		document.getElementById("error").play();
		alert("Task already exists!");
		return;
	} else {
		if (target.className === 'todo-items') {
			const newTask = document.createElement('li');
			newTask.draggable = true;
			newTask.id = 'todo-task' + target.children.length;
			newTask.addEventListener('dragstart', dragStart, false);
			newTask.innerHTML = `<span class="task-name">${data["value"]}</span><button class="edit" onclick="editTask('.todo-items')">Edit</button><button class="remove" onclick="removeTask('.todo-items')">Remove</button>`;
			target.appendChild(newTask);
			const oldList = document.querySelector(`.${data["itemList"]}`);
			oldList.removeChild(oldList.children[findIndex(data["value"], oldList.children)]);
			storeTasks();

		} else if (target.className === 'progress-items') {
			const newTask = document.createElement('li');
			newTask.draggable = true;
			newTask.id = 'prog-task' + target.children.length;
			newTask.addEventListener('dragstart', dragStart, false);
			newTask.innerHTML = `<span class="task-name">${data["value"]}</span><button class="edit" onclick="editTask('.progress-items')">Edit</button><button class="remove" onclick="removeTask('.progress-items')">Remove</button>`;
			target.appendChild(newTask);
			const oldList = document.querySelector(`.${data["itemList"]}`);
			oldList.removeChild(oldList.children[findIndex(data["value"], oldList.children)]);
			storeTasks();
		} else if (target.className === 'done-items') {
			const newTask = document.createElement('li');
			newTask.draggable = true;
			newTask.id = 'done-task' + target.children.length;
			newTask.addEventListener('dragstart', dragStart, false);
			newTask.innerHTML = `<span class="task-name complete">${data["value"]}</span><button class="edit" onclick="editTask('.done-items')">Edit</button><button class="remove" onclick="removeTask('.done-items')">Remove</button>`;
			target.appendChild(newTask);
			const oldList = document.querySelector(`.${data["itemList"]}`);
			oldList.removeChild(oldList.children[findIndex(data["value"], oldList.children)]);
			storeTasks();
		} else {
			document.getElementById("error").play();
			alert("Drop target not found!");
			return;
		}
	}
};

const storeTasks = () => {
	const todoItems = Array.from(document.querySelector('.todo-items').children).map(li => li.children[0].innerHTML);
  	const progressItems = Array.from(document.querySelector('.progress-items').children).map(li => li.children[0].innerHTML);
  	const doneItems = Array.from(document.querySelector('.done-items').children).map(li => li.children[0].innerHTML);
  
  	localStorage.setItem('todoItems', JSON.stringify(todoItems));
  	localStorage.setItem('progressItems', JSON.stringify(progressItems));
  	localStorage.setItem('doneItems', JSON.stringify(doneItems));
}

window.onload = () => {
	const todoItems = JSON.parse(localStorage.getItem('todoItems')) || [];
  	const progressItems = JSON.parse(localStorage.getItem('progressItems')) || [];
  	const doneItems = JSON.parse(localStorage.getItem('doneItems')) || [];

  	const addTaskToList = (taskName, list) => {
  	  	const newTask = document.createElement('li');
  	  	newTask.draggable = true;
  	  	newTask.id = `${list}-task${document.querySelector(`.${list}-items`).children.length}`;
  	  	newTask.addEventListener('dragstart', dragStart, false);
			if (list === 'done') {
				newTask.innerHTML = `<span class="task-name complete">${taskName}</span><button class="edit" onclick="editTask('.${list}-items')">Edit</button><button class="remove" onclick="removeTask('.${list}-items')">Remove</button>`;
			} else {
				newTask.innerHTML = `<span class="task-name">${taskName}</span><button class="edit" onclick="editTask('.${list}-items')">Edit</button><button class="remove" onclick="removeTask('.${list}-items')">Remove</button>`;
			}
  	  	document.querySelector(`.${list}-items`).appendChild(newTask);
  	};

  	todoItems.forEach(taskName => addTaskToList(taskName, 'todo'));
  	progressItems.forEach(taskName => addTaskToList(taskName, 'progress'));
  	doneItems.forEach(taskName => addTaskToList(taskName, 'done'));
}