const ADD_IDEA = 'ADD_IDEA';
const SET_VISIBILITY_FILTER = 'SET_VISIBILITY_FILTER';
const VISIBIlTY_FILTERS = {
	SHOW_ALL: 'SHOW_ALL'
};

function addIdea(text) {
	return {
		type: ADD_IDEA,
		text: text
	};
}