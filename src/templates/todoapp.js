import {inform, exec} from 'ef.js'

import 'classlist-polyfill'

import _todoapp from './tmpls/todoapp.eft'
import _main from './tmpls/main.eft'
import _todo from './tmpls/todo.eft'
import _footer from './tmpls/footer.eft'

import ARR from '../array-helper.js'

const todoapp = new _todoapp()
const main = new _main()
const footer = new _footer()
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
	if (l.$data.stored.order > r.$data.stored.order) return 1
	return -1
}

const updateList = (hash) => {
	inform()
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
	exec()
}

const updateCount = () => {
	if (all.length === 0) {
		footer.$ctx.nodeInfo.element.style.display = 'none'
		main.$ctx.nodeInfo.element.style.display = 'none'
	} else {
		footer.$ctx.nodeInfo.element.style.display = 'block'
		main.$ctx.nodeInfo.element.style.display = 'block'
	}

	if (all.length !== 0 && all.length === completed.length) main.$data.allCompleted = true
	else main.$data.allCompleted = false

	if (completed.length === 0) footer.$refs.clear.style.display = 'none'
	else footer.$refs.clear.style.display = 'block'
	footer.$data.count = todos.length
	if (todos.length > 1) footer.$data.s = 's'
	else footer.$data.s = ''
}

const toggleAll = ({value}) => {
	inform()
	if (value) {
		const _todos = ARR.copy(todos)
		for (let i of _todos) {
			i.$data.stored.completed = true
		}
	} else if (completed.length === all.length) {
		const _completed = ARR.copy(completed)
		for (let i of _completed) i.$data.stored.completed = false
	}
	if (location.hash !== '#/') updateList(location.hash)
	exec()
}

const clear = () => {
	inform()
	for (let i of completed) {
		ARR.remove(all, i)
		ARR.remove(storage, i.$data.stored)
		main.todos.remove(i)
		i.$destroy()
	}
	completed.length = 0
	updateCount()
	updateStorage()
	updateList(location.hash)
	exec()
}

const destroy = ({state}) => {
	inform()
	ARR.remove(all, state)
	ARR.remove(storage, state.$data.stored)
	ARR.remove(completed, state)
	ARR.remove(todos, state)

	state.$destroy()
	updateCount()
	updateStorage()
	updateList(location.hash)
	exec()
}

const toggleComplete = function({value: checked}) {
	inform()
	if (checked) {
		this.$data.completed = 'completed'
		ARR.remove(todos, this)
		completed.push(this)
		if (location.hash === '#/active') main.todos.remove(this)
	} else {
		this.$data.completed = ''
		todos.push(this)
		ARR.remove(completed, this)
		window._this_ = this
		if (location.hash === '#/completed') main.todos.remove(this)
	}
	updateCount()
	updateStorage()
	exec()
}

const confirm = ({e, state, value}) => {
	inform()
	const newVal = value.trim()
	if (!newVal) return exec(destroy({state}))
	state.$data.editing = ''
	state.$data.stored.title = newVal
	if (e.type === 'blur') state.$data.update = ''
	updateStorage()
	exec()
}

const cancel = ({state, value}) => {
	inform()
	state.$data.editing = ''
	state.$data.update = value
	exec()
}

const edit = ({state}) => {
	inform()
	state.$data.update = state.$data.stored.title
	state.$data.editing = 'editing'
	exec()
	state.$refs.edit.focus()
}

const blur = ({state}) => {
	state.$refs.edit.blur()
}

const add = (value) => {
	value.order = order += 1
	value.completed = !!value.completed
	const todo = new _todo({
		$data: {stored: value},
		$methods: {
			blur,
			edit,
			cancel,
			confirm,
			destroy
		}
	})

	all.push(todo)
	storage.push(todo.$data.stored)

	if (!value.completed && location.hash !== '#/completed') main.todos.push(todo)

	todo.$subscribe('stored.completed', toggleComplete.bind(todo))

	updateCount()
	updateStorage()

	todoapp.$refs.input.focus()
}

const addTodo = ({state, value}) => {
	value = value.trim()
	inform()
	if (!value) return exec()
	state.$data.input = ''
	add({
		title: value,
		completed: false
	})
	exec()
}

todoapp.$methods.addTodo = addTodo
footer.$methods.clear = clear
main.$subscribe('allCompleted', toggleAll)

const lastStorage = localStorage.getItem('todos-ef')
if (lastStorage) {
	const lastTodos = JSON.parse(lastStorage)
	inform()
	for (let i of lastTodos) add(i)
	exec()
}

if (!(/^#\/(active|completed)?$/).test(location.hash)) window.location = '#/'

updateList(location.hash)

window.addEventListener('hashchange', () => updateList(location.hash))

export default todoapp
