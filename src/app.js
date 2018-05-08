import todoapp from './templates/todoapp.js'

todoapp.$mount({
	target: '.todoapp',
	option: 'replace'
})

window.todoapp = todoapp
