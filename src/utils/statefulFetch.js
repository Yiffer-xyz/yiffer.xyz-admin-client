const defaultState = {fetching: false, fetched: false, failed: false, payload: null, errorMessage: null}

export function registerFetchNames (store, ...namesWithDefaults) {
  namesWithDefaults.forEach(({name, defaultValue}) => {
    let thisDefaultState = {...defaultState, payload: defaultValue, name: name}
    store.state[name] = thisDefaultState
  
    store.getters[name] = state => state[name]
    store.getters[`get_${name}`] = state => () => state[name]
  
    store.mutations[`set_${name}_fetching`] = 
      (state) => state[name] = {...thisDefaultState, fetching: true}
  
    store.mutations[`set_${name}_fetched`] =
      (state, payload) => state[name] = {...thisDefaultState, fetched: true, payload}
  
    store.mutations[`set_${name}_error`] =
      (state, {message, code}) => state[name] = {
        ...thisDefaultState, failed: true, errorMessage: message, errorCode: code
      }
  
    store.mutations[`set_${name}_clear`] =
      (state) => state[name] = thisDefaultState
  })
}

export async function doFetch (commit, actionName, fetchPromise, transformFunc) {
  commit(`set_${actionName}_fetching`)
  try {
    let result = await fetchPromise
    if (transformFunc) {
      result = transformFunc(result)
    }
    commit(`set_${actionName}_fetched`, result)
    
    if (result === undefined) {
      return true
    }
    return result
  }
  catch (err) {
    commit(`set_${actionName}_error`, {message: err.response?.data, status: err.response?.status})
    return false
  }
}

export async function doFetchSilent (commit, actionName, fetchPromise, transformFunc) {
  try {
    let result = await fetchPromise
    if (transformFunc) {
      result = transformFunc(result)
    }
    commit(`set_${actionName}_fetched`, result)
  }
  catch (err) {
    commit(`set_${actionName}_error`, err.message)
  }
}

export async function fetchClear (commit, actionName) {
  commit(`set_${actionName}_clear`)
}