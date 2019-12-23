import { drag } from 'd3-drag';
import { event, select } from 'd3-selection';
import partial from 'lodash/partial';

function handler(type) {
  if (this.__vue__) {
    this.__vue__.$emit(type, event);
  }
}

const dragBehavior = drag()
  .on('start', partial(handler, 'drag-start'))
  .on('drag', partial(handler, 'drag-move'))
  .on('end', partial(handler, 'drag-end'));

export default {
  bind(el) {
    select(el).call(dragBehavior);
  },
  unbind(el) {
    select(el).on('.drag', null);
  }
};
