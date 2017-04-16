import 'classlist-polyfill'

import _todoapp from './tmpls/todoapp.eft'
import _main from './tmpls/main.eft'
import _todo from './tmpls/todo.eft'
import _footer from './tmpls/footer.eft'

import ARR from '../array-helper.js'

const todoapp = _todoapp.render()
const main = _main.render()
const footer = _footer.render()
let order = 0

todoapp.main = main
todoapp.footer = footer

const todos = []
const completed = []
const all = []
const storage = []

const updateStorage = () => {
	localStorage.setItem('todos-ef', JSON.stringify(storage))
}

const sortList = (l, r) => {
	if (l.$data.order > r.$data.order) return 1
	return -1
}

const updateList = (hash) => {
	switch (hash) {
		case '#/active': {
			main.todos = todos.sort(sortList)
			footer.$data = {
				allSelected: '',
				activeSelected: 'selected',
				completedSelected: ''
			}
			break
		}
		case '#/completed': {
			main.todos = completed.sort(sortList)
			footer.$data = {
				allSelected: '',
				activeSelected: '',
				completedSelected: 'selected'
			}
			break
		}
		default: {
			main.todos = all
			footer.$data = {
				allSelected: 'selected',
				activeSelected: '',
				completedSelected: ''
			}
		}
	}
}

const updateCount = () => {
	if (all.length === 0) {
		footer.$element.style.display = 'none'
		main.$element.style.display = 'none'
	} else {
		footer.$element.style.display = 'block'
		main.$element.style.display = 'block'
	}

	if (all.length !== 0 && all.length === completed.length) main.$data.allCompleted = true
	else main.$data.allCompleted = false

	if (completed.length === 0) footer.$nodes.clear.style.display = 'none'
	else footer.$nodes.clear.style.display = 'block'
	footer.$data.count = todos.length
	if (todos.length > 1) footer.$data.s = 's'
	else footer.$data.s = ''
}

const toggleAll = (value) => {
	if (value) {
		const _todos = ARR.copy(todos)
		for (let i of _todos) {
			i.$data.completed = true
		}
	} else if (completed.length === all.length) {
		const _completed = ARR.copy(completed)
		for (let i of _completed) i.$data.completed = false
	}
	if (location.hash !== '#/') updateList(location.hash)
}

const clear = () => {
	for (let i of completed) {
		ARR.remove(all, i)
		ARR.remove(storage, i.$data)
		main.todos.remove(i)
		i.$destroy()
	}
	completed.length = 0
	updateCount()
	updateStorage()
	updateList(location.hash)
}

const destroy = ({state}) => {
	ARR.remove(all, state)
	main.todos.remove(state)

	ARR.remove(storage, state.$data)
	ARR.remove(todos, state)
	ARR.remove(completed, state)

	state.$destroy()
	updateCount()
	updateStorage()
	updateList(location.hash)
}

const toggleComplete = function(checked) {
	if (checked) {
		this.$element.classList.add('completed')
		ARR.remove(todos, this)
		completed.push(this)
		if (location.hash === '#/active') main.todos.remove(this)
	} else {
		this.$element.classList.remove('completed')
		todos.push(this)
		ARR.remove(completed, this)
		if (location.hash === '#/completed') main.todos.remove(this)
	}
	updateCount()
	updateStorage()
}

const confirm = ({e, state}) => {
	const newVal = state.$data.update.trim()
	if (!newVal) return destroy({state})
	state.$element.classList.remove('editing')
	state.$data.title = newVal
	if (e.type === 'blur') state.$data.update = ''
	updateStorage()
}

const cancle = ({state}) => {
	state.$element.classList.remove('editing')
	state.$methods.confirm = null
	state.$data.update = ''
}

const edit = ({state}) => {
	state.$element.classList.add('editing')
	state.$data.update = state.$data.title
	state.$nodes.edit.focus()
}

const add = (value) => {
	value.order = order += 1
	value.completed = !!value.completed
	const todo = _todo.render({
		$data: value,
		$methods: {
			edit,
			cancle,
			confirm,
			destroy
		}
	})

	all.push(todo)
	storage.push(todo.$data)

	if (!value.completed && location.hash !== '#/completed') main.todos.push(todo)

	todo.$subscribe('completed', toggleComplete.bind(todo))

	updateCount()
	updateStorage()

	todoapp.$nodes.input.focus()
}

const addTodo = ({state, value}) => {
	value = value.trim()
	if (!value) return
	state.$data.input = ''
	add({
		title: value,
		completed: false
	})
}

todoapp.$methods.addTodo = addTodo
footer.$methods.clear = clear
main.$subscribe('allCompleted', toggleAll)

const lastStorage = localStorage.getItem('todos-ef')
if (lastStorage) {
	const lastTodos = JSON.parse(lastStorage)
	for (let i of lastTodos) add(i)
}

if (!(/^#\/(active|completed)?$/).test(location.hash)) window.location = '#/'

updateList(location.hash)

window.addEventListener('hashchange', () => updateList(location.hash))

export default todoapp
