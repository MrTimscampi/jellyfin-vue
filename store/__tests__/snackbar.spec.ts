import Vue, { VueConstructor } from 'vue';
import { createLocalVue } from '@vue/test-utils';
import Vuex, { Store } from 'vuex';
import cloneDeep from 'lodash/cloneDeep';
import {
  state,
  mutations,
  actions,
  SnackbarState,
  defaultState
} from '../snackbar';

const SNACKBAR_SET_TEST_VALUE = {
  message: 'Test Message',
  color: 'Test Color'
};

let localVue: VueConstructor<Vue>;
let store: Store<SnackbarState>;

beforeEach(() => {
  localVue = createLocalVue();
  localVue.use(Vuex);

  store = new Vuex.Store(cloneDeep({ state, mutations, actions }));
});

test('When "SET_SNACKBAR_MESSAGE" is committed, the snackbar message is set.', () => {
  store.replaceState({ ...defaultState() });

  store.commit('SET_SNACKBAR_MESSAGE', SNACKBAR_SET_TEST_VALUE);

  expect(store.state).toMatchObject(SNACKBAR_SET_TEST_VALUE);
});

test('When "RESET_MESSAGE" is committed, the message is reset.', () => {
  store.replaceState({ ...SNACKBAR_SET_TEST_VALUE });

  store.commit('RESET_MESSAGE');

  expect(store.state).toMatchObject(defaultState());
});

test('When pushSnackbarMessage is called, snackbar message is set. Case A', () => {
  store.replaceState({ ...defaultState() });

  store.dispatch('pushSnackbarMessage', SNACKBAR_SET_TEST_VALUE);

  expect(store.state).toMatchObject(SNACKBAR_SET_TEST_VALUE);
});

// Undefined color is '' when color is not passed
test('When pushSnackbarMessage is called, snackbar message is set. Case B', () => {
  store.replaceState({ ...defaultState() });

  store.dispatch('pushSnackbarMessage', {
    ...SNACKBAR_SET_TEST_VALUE,
    color: undefined
  });

  expect(store.state).toMatchObject({
    ...SNACKBAR_SET_TEST_VALUE,
    color: ''
  });
});

test('When resetMessage is called, snackbar message is reset.', () => {
  store.replaceState({ ...SNACKBAR_SET_TEST_VALUE });

  store.dispatch('resetMessage');

  expect(store.state).toMatchObject(defaultState());
});
