import PropTypes from 'prop-types';
import React from 'react';
import ImmutablePropTypes from 'react-immutable-proptypes';
import Waypoint from 'react-waypoint';
import { Map } from 'immutable';
import c from 'classnames';
import history from '../../routing/history';
import { resolvePath } from '../../lib/pathHelper';
import { selectFields, selectInferedField } from '../../reducers/collections';

export default class EntryListing extends React.Component {
  static propTypes = {
    publicFolder: PropTypes.string.isRequired,
    collections: PropTypes.oneOfType([
      ImmutablePropTypes.map,
      ImmutablePropTypes.iterable,
    ]).isRequired,
    entries: ImmutablePropTypes.list,
    onPaginate: PropTypes.func.isRequired,
    page: PropTypes.number,
  };

  handleLoadMore = () => {
    this.props.onPaginate(this.props.page + 1);
  };

  inferFields(collection) { //eslint-disable-line
    const titleField = selectInferedField(collection, 'title');
    const descriptionField = selectInferedField(collection, 'description');
    const imageField = selectInferedField(collection, 'image');
    const fields = selectFields(collection);
    const inferedFields = [titleField, descriptionField, imageField];
    const remainingFields = fields && fields.filter(f => inferedFields.indexOf(f.get('name')) === -1);
    return { titleField, descriptionField, imageField, remainingFields };
  }

  renderCard(collection, entry, inferedFields, publicFolder) {
    const path = `/collections/${ collection.get('name') }/entries/${ entry.get('slug') }`;
    const label = entry.get('label');
    const title = label || entry.getIn(['data', inferedFields.titleField]);
    let image = entry.getIn(['data', inferedFields.imageField]);
    image = resolvePath(image, publicFolder);
    if(image) {
      image = encodeURI(image);
    }

    return (
      <div
        key={entry.get('slug')}
        onClick={() => history.push(path)} // eslint-disable-line
        className="nc-entryListing-card"
      >
        { image &&
        <header className="nc-entryListing-cardImage" style={{ backgroundImage: `url(${ image })` }} />
        }
        <div className={c('nc-entryListing-cardBody', { 'nc-entryListing-cardBody-full': !image })}>
          <h2 className="nc-entryListing-cardHeading">{title}</h2>
          {inferedFields.descriptionField ?
            <p>{entry.getIn(['data', inferedFields.descriptionField])}</p>
            : inferedFields.remainingFields && inferedFields.remainingFields.map(f => (
              <p key={f.get('name')} className="nc-entryListing-cardList">
                <span className="nc-entryListing-cardListLabel">{f.get('label')}:</span>{' '}
                { (entry.getIn(['data', f.get('name')]) || '').toString() }
              </p>
            ))
          }
        </div>
      </div>
    );
  }
  renderCards = () => {
    const { collections, entries, publicFolder } = this.props;

    if (Map.isMap(collections)) {
      const inferedFields = this.inferFields(collections);
      return entries.map(entry => this.renderCard(collections, entry, inferedFields, publicFolder));
    }
    return entries.map((entry) => {
      const collection = collections
        .filter(collection => collection.get('name') === entry.get('collection')).first();
      const inferedFields = this.inferFields(collection);
      return this.renderCard(collection, entry, inferedFields, publicFolder);
    });
  };

  render() {
    return (
      <div>
        <div className="nc-entryListing-cardsGrid">
          { this.renderCards() }
          <Waypoint onEnter={this.handleLoadMore} />
        </div>
      </div>
    );
  }
}
