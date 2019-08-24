import { ADD_IDEA, VISIBIlTY_FILTERS, SET_VISIBILITY_FILTER } from './actions';
import { combineReducers } from 'redux'

const initialState = {
	visibilityFilter: VISIBIlTY_FILTERS.SHOW_ALL,
	ideas: []
}

function ideaApp(state = initialState, action) {
	switch(action.type) {
		
		case ADD_IDEA:
			return Object.assign({}, state, {
				ideas: [...state.ideas, {
					text: action.text
				}]
			});
		
		case SET_VISIBILITY_FILTER:
			return Object.assign({}, state, {
				visibilityFilter: action.filter
			});
	
	
	default:
		return state
	}
	return state;
}

export default ideaApp;