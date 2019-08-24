import { VISIBIlTY_FILTERS } from './actions';

const initialState = {
	visibilityFilter: VISIBIlTY_FILTERS.SHOW_ALL,
	ideas: []
}

function ideaApp(state = initialstate, action) {
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
	}
	
	return state;
}