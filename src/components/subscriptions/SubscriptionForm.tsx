import * as React from 'react';
import {
  CreateLogSubscriptionRequest,
  CreateTransactionSubscriptionRequest,
  Subscription,
  SubscriptionType
} from '../../debt/ethercast-backend-model';
import { Button, Form, FormProps, Header, Input, TextArea } from 'semantic-ui-react';
import { Link } from 'react-router-dom';
import FormComponent from '../FormComponent';
import FiltersInput from './FiltersInput';
import Label from 'semantic-ui-react/dist/commonjs/elements/Label/Label';
import Segment from 'semantic-ui-react/dist/commonjs/elements/Segment/Segment';
import Divider from 'semantic-ui-react/dist/commonjs/elements/Divider/Divider';

export interface SubscriptionFormProps extends FormProps {
  value: Partial<CreateLogSubscriptionRequest | CreateTransactionSubscriptionRequest>;
  onChange: (subscription: Partial<CreateLogSubscriptionRequest | CreateTransactionSubscriptionRequest>) => void;
  onSubmit: () => void;
}

const REQUEST_BIN_HOST = 'https://requestbin.fullcontact.com';

class SubscriptionDetailsForm extends FormComponent<Subscription> {
  state = {
    generatingUrl: false
  };

  generateUrl = async () => {
    const { generatingUrl } = this.state;
    if (generatingUrl) {
      return;
    }

    this.setState({ generatingUrl: true });

    const response =
      await fetch(`${REQUEST_BIN_HOST}/api/v1/bins`, { method: 'POST' });

    if (response.status !== 200) {
      this.setState({ generatingUrl: false });
      alert('Sorry, we couldn\'t get one this time. Try going to https://requestbin.fullcontact.com/');
    } else {
      const { name } = await response.json();

      this.props.onChange({
        ...this.props.value,
        webhookUrl: `${REQUEST_BIN_HOST}/${name}`,
        description: `View subscription messages at ${`${REQUEST_BIN_HOST}/${name}?inspect`}`
      });

      this.setState({ generatingUrl: false });
    }
  };

  render() {
    const { value } = this.props;
    return (
      <div>
        <Form.Field required>
          <label>Name</label>
          <Input
            name="name"
            type="text"
            placeholder="My First Subscription"
            onChange={this.inputChangeHandler('name')}
            value={value && value.name || ''}
            required
          />
        </Form.Field>
        <Form.Field required>
          <label>Webhook URL</label>
          <Input
            type="url"
            placeholder="https://my-domain.com/accept-webhook"
            onChange={this.inputChangeHandler('webhookUrl')}
            required
            value={value && value.webhookUrl || ''}
            action={{
              color: 'blue',
              type: 'button',
              loading: this.state.generatingUrl,
              labelPosition: 'right',
              icon: 'plus',
              content: 'Get test URL',
              onClick: this.generateUrl
            }}
          />
        </Form.Field>
        <Form.Field>
          <label>Description</label>
          <TextArea
            value={value && value.description || ''}
            name="description"
            placeholder="Notify me when events happen"
            onChange={this.inputChangeHandler('description') as any}
          />
        </Form.Field>
      </div>
    );
  }
}

export default class SubscriptionForm extends React.PureComponent<SubscriptionFormProps> {
  handleChange = (changes: Partial<CreateLogSubscriptionRequest | CreateTransactionSubscriptionRequest>) => {
    console.log(changes);
    this.props.onChange({ ...this.props.value, ...changes } as any);
  };

  handleFiltersChange = (filters: any) => this.handleChange({
    filters
  });

  onSubmit = (e: any) => {
    e.preventDefault();
    this.props.onSubmit();
  };

  public render() {
    const { value, onChange, ...rest } = this.props;

    return (
      <Form size="big" {...rest} onSubmit={this.onSubmit}>
        <div>
          <SubscriptionDetailsForm value={value} onChange={this.handleChange}/>

          <Header as="h2">
            Subscription filters <Label color="yellow">enter at least one</Label>
          </Header>

          <Segment>
            <div style={{ textAlign: 'center' }}>
              <Button.Group>
                <Button
                  type="button"
                  positive={value && value.type === SubscriptionType.log}
                  onClick={() => this.handleChange({ type: SubscriptionType.log, filters: {} })}
                >
                  Logs
                </Button>
                <Button.Or/>
                <Button
                  type="button"
                  positive={value && value.type === SubscriptionType.transaction}
                  onClick={() => this.handleChange({ type: SubscriptionType.transaction, filters: {} })}
                >
                  Transactions
                </Button>
              </Button.Group>
            </div>

            <Divider/>

            <FiltersInput
              type={value && value.type ? value.type : SubscriptionType.log}
              value={value.filters}
              onChange={this.handleFiltersChange}
            />
          </Segment>
        </div>
        <div style={{ padding: 10, textAlign: 'right' }}>
          <Button size="big" as={Link} to="/subscriptions">Cancel</Button>
          <Button size="big" type="submit" primary={true}>Submit</Button>
        </div>
      </Form>
    );
  }
}
