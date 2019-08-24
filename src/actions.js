export const ADD_IDEA = 'ADD_IDEA';
export const SET_VISIBILITY_FILTER = 'SET_VISIBILITY_FILTER';
export const VISIBIlTY_FILTERS = {
	SHOW_ALL: 'SHOW_ALL'
}

export function addIdea(text) {
	return {
		type: ADD_IDEA,
		text: text
	};
}

