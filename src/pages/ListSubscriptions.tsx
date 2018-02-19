import * as qs from 'qs';
import * as React from 'react';
import { ChangeEvent } from 'react';
import { Link, withRouter } from 'react-router-dom';
import SubscriptionList from '../components/subscriptions/SubscriptionList';
import { listSubscriptions } from '../util/api';
import mustBeLoggedIn from '../util/mustBeLoggedIn';
import { RouteComponentProps } from 'react-router';
import { Subscription } from '../util/model';
import Button from 'semantic-ui-react/dist/commonjs/elements/Button/Button';
import Icon from 'semantic-ui-react/dist/commonjs/elements/Icon/Icon';
import Container from 'semantic-ui-react/dist/commonjs/elements/Container/Container';
import Dimmer from 'semantic-ui-react/dist/commonjs/modules/Dimmer/Dimmer';
import Loader from 'semantic-ui-react/dist/commonjs/elements/Loader/Loader';
import Breadcrumb from 'semantic-ui-react/dist/commonjs/collections/Breadcrumb/Breadcrumb';
import * as _ from 'underscore';

class ListSubscriptions extends React.Component<RouteComponentProps<{}>, { subscriptions: Subscription[] | null, promise: Promise<any> | null }> {
  state = {
    subscriptions: null,
    promise: null
  };

  componentDidMount() {
    this.fetchSubs();
  }

  fetchSubs = () => {
    const { promise } = this.state;
    if (promise) {
      return;
    }

    this.setState({
      promise: listSubscriptions()
        .then(subscriptions => this.setState({ subscriptions, promise: null }))
        .catch(error => this.setState({ promise: null }))
    });
  };

  handleChange = ({ target: { value } }: ChangeEvent<HTMLInputElement>) => {
    const { history } = this.props;

    history.replace({
      pathname: '/subscriptions',
      search: `q=${value}`
    });
  };

  render() {
    const { history } = this.props;
    const { subscriptions, promise } = this.state;

    const { search } = history.location;

    let filteredSubs: Subscription[] = subscriptions || [];

    let q = '';
    if (search && search.length > 1) {
      q = qs.parse(search.substr(1)).q || '';

      filteredSubs = _.filter(
        filteredSubs,
        ({ name }: Subscription) => !q || name.toLowerCase().indexOf(q) !== -1
      );
    }

    return (
      <Container>
        <Breadcrumb>
          <Breadcrumb.Section active>Subscriptions</Breadcrumb.Section>
        </Breadcrumb>

        <div>
          <input placeholder="Search" onChange={this.handleChange} value={q}/>
          <Button as={Link} to="/subscriptions/new"><Icon name="add"/> Create</Button>
        </div>

        <div style={{ marginTop: 20 }}>
          <Dimmer.Dimmable dimmed={promise !== null}>
            <Dimmer active={promise !== null}>
              <Loader>
                Loading...
              </Loader>
            </Dimmer>

            <SubscriptionList items={filteredSubs}/>
          </Dimmer.Dimmable>
        </div>
      </Container>
    );
  }
}

export default withRouter(mustBeLoggedIn(ListSubscriptions));
