const ADD_IDEA = 'ADD_IDEA'

const VISIBIlTY_FILTERS = {
	SHOW_ALL: 'SHOW_ALL'
}

function addIdea(text) {
	return {
		type: ADD_IDEA,
		text: text
	};
}