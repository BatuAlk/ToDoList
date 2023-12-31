const addTask = () => {
	const input = document.querySelector('#add-task');
	const todoList = document.querySelector('.todo-items');
	const taskName = input.value;

	if (taskName === "") {
		return;
	} else if (containsTask(taskName, todoList.getElementsByTagName('span'))) {
		document.getElementById("error").play();
		alert("Task already exists!");
		return;
	} else {
		const newTask = document.createElement('li');
		newTask.draggable = true;
		newTask.addEventListener('dragstart', dragStart, false);
		newTask.innerHTML = `<span class="task-name">${taskName}</span><button class="edit" onclick="editTask('.todo-items')">Edit</button><button class="remove" onclick="removeTask('.todo-items')">Remove</button>`;
		todoList.appendChild(newTask);
		input.value = '';
		storeTasks();
	}
};

const removeTask = (itemList) => {
	const list = document.querySelector(itemList);
    const removeItem = (e) => {
		if (e.target.classList.contains('remove')) {
			const conf = "Are you sure you want to remove this task? Press 'OK' to remove or 'Cancel' to cancel.";
			if (confirm(conf)) {
				const li = e.target.parentElement;
				list.removeChild(li);
				storeTasks();
			}
		}
		list.removeEventListener('click', removeItem);
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
				const edit = li.children[1];
				const remove = li.children[2];
				const input = document.createElement('input');
				li.draggable = false;
				input.className = 'edit-input';
				input.type = 'text';
				input.value = span.innerHTML;
				li.insertBefore(input, span);
				li.removeChild(span);
				li.removeChild(edit);
				li.removeChild(remove);
				input.focus();
				
				const saveButton = document.createElement('button');
				saveButton.className = 'save';
				saveButton.innerHTML = 'Save';
				const cancelButton = document.createElement('button');
				cancelButton.className = 'cancel';
				cancelButton.innerHTML = 'Cancel';
				const editButtons = document.querySelectorAll('.edit');
				editButtons.forEach((button) => {
					button.disabled = true;
					button.style.background = 'gray';
					button.style.cursor = 'not-allowed';
				});
				const removeButtons = document.querySelectorAll('.remove');
				removeButtons.forEach((button) => {
					button.disabled = true;
					button.style.background = 'gray';
					button.style.cursor = 'not-allowed';
				});
				const draggables = document.querySelectorAll('li');
				draggables.forEach((draggable) => {
					draggable.style.cursor = 'default';
					draggable.draggable = false;
				});

				li.appendChild(saveButton);
				li.appendChild(cancelButton);
				saveButton.addEventListener('click', () => {
					li.draggable = true;
					const newTaskName = input.value;
					if (newTaskName === "") {
						document.getElementById("error").play();
						alert("Please enter a task name!");
						edited = true;
						return;
					} else if (containsTask(newTaskName, list.getElementsByTagName('span'))) {
						document.getElementById("error").play();
						alert("Task already exists!");
						edited = true;
						return;
					} else {
						span.innerHTML = newTaskName;
						li.removeChild(input);
						li.removeChild(saveButton);
						li.removeChild(cancelButton);
						li.appendChild(span);
						li.appendChild(edit);
						li.appendChild(remove);
						editButtons.forEach((button) => {
							button.disabled = false;
							button.style.background = 'goldenrod';
							button.style.cursor = 'pointer';
						});
						removeButtons.forEach((button) => {
							button.disabled = false;
							button.style.background = 'rgba(163, 0, 0, 0.862)';
							button.style.cursor = 'pointer';
						});
						draggables.forEach((draggable) => {
							draggable.style.cursor = 'grab';
							draggable.draggable = true;
						});
						edited = true;
						storeTasks();
					}
				});

				cancelButton.addEventListener('click', () => {
					li.draggable = true;
					li.removeChild(input);
					li.removeChild(saveButton);
					li.removeChild(cancelButton);
					li.appendChild(span);
					li.appendChild(edit);
					li.appendChild(remove);
					editButtons.forEach((button) => {
						button.disabled = false;
						button.style.background = 'goldenrod';
						button.style.cursor = 'pointer';
					});
					removeButtons.forEach((button) => {
						button.disabled = false;
						button.style.background = 'rgba(163, 0, 0, 0.862)';
						button.style.cursor = 'pointer';
					});
					draggables.forEach((draggable) => {
						draggable.style.cursor = 'grab';
						draggable.draggable = true;
					});
					edited = true;
				});
			}
		}
	};
	list.addEventListener('click', editItem);
}

const dragStart = (e) => {
	e.target.style.cursor = 'grabbing';
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
		if (taskList[i].querySelector('.task-name').textContent === taskName) {
			return i;
		}
	}
	return -1;
}

const findTarget = (target) => {
	if (target.className === 'todo' || target.className === 'progress' || target.className === 'done') {
		return target.children[2];
	} else if (target.className === 'todo-items' || target.className === 'progress-items' || target.className === 'done-items') {
		return target;
	} else if (target.parentElement.className === 'todo-items' || target.parentElement.className === 'progress-items' || target.parentElement.className === 'done-items') {
		return target.parentElement;
	}
};

const drop = (e) => {
	e.preventDefault();
	const data = JSON.parse(e.dataTransfer.getData('data'));
	const target = e.target;
	const validTarget = findTarget(target);
	if (validTarget === null || validTarget === undefined) {
		document.getElementById("error").play();
		target.style.cursor = 'grab';
		alert("Drop target not found!");
		return;
	}

	if (containsTask(data["value"], validTarget.getElementsByTagName('span'))) {
		document.getElementById("error").play();
		alert("Task already exists!");
		return;
	} else {
		if (validTarget.className === 'todo-items') {
			const newTask = document.createElement('li');
			newTask.draggable = true;
			newTask.addEventListener('dragstart', dragStart, false);
			newTask.innerHTML = `<span class="task-name">${data["value"]}</span><button class="edit" onclick="editTask('.todo-items')">Edit</button><button class="remove" onclick="removeTask('.todo-items')">Remove</button>`;
			validTarget.appendChild(newTask);
			const oldList = document.querySelector(`.${data["itemList"]}`);
			oldList.removeChild(oldList.children[findIndex(data["value"], oldList.children)]);	

		} else if (validTarget.className === 'progress-items') {
			const newTask = document.createElement('li');
			newTask.draggable = true;
			newTask.addEventListener('dragstart', dragStart, false);
			newTask.innerHTML = `<span class="task-name">${data["value"]}</span><button class="edit" onclick="editTask('.progress-items')">Edit</button><button class="remove" onclick="removeTask('.progress-items')">Remove</button>`;
			validTarget.appendChild(newTask);
			const oldList = document.querySelector(`.${data["itemList"]}`);
			oldList.removeChild(oldList.children[findIndex(data["value"], oldList.children)]);

		} else if (validTarget.className === 'done-items') {
			const newTask = document.createElement('li');
			newTask.draggable = true;
			newTask.addEventListener('dragstart', dragStart, false);
			newTask.innerHTML = `<span class="task-name complete">${data["value"]}</span><button class="edit" onclick="editTask('.done-items')">Edit</button><button class="remove" onclick="removeTask('.done-items')">Remove</button>`;
			validTarget.appendChild(newTask);
			const oldList = document.querySelector(`.${data["itemList"]}`);
			oldList.removeChild(oldList.children[findIndex(data["value"], oldList.children)]);

		}
	}
	storeTasks();
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
	
	const addButton = document.querySelector('.add-input');
	addButton.focus();
}