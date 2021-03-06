/* @flow */
import * as React from 'react';
import { connect } from 'react-redux';
import NetworkConnectivity from './NetworkConnectivity';
import type { HTTPMethod, FluxAction, NetworkState } from '../types';
import { connectionChange } from '../redux/actionCreators';
import {
  DEFAULT_HTTP_METHOD,
  DEFAULT_PING_SERVER_URL,
  DEFAULT_TIMEOUT,
} from '../utils/constants';

type Props = {
  dispatch: FluxAction => FluxAction,
  isConnected: boolean,
  actionQueue: Array<FluxAction>,
  pingTimeout?: number,
  pingServerUrl?: string,
  shouldPing?: boolean,
  pingInterval?: number,
  pingOnlyIfOffline?: boolean,
  pingInBackground?: boolean,
  httpMethod?: HTTPMethod,
  children: React.Node,
};

class ReduxNetworkProvider extends React.Component<Props> {
  static defaultProps = {
    pingTimeout: DEFAULT_TIMEOUT,
    pingServerUrl: DEFAULT_PING_SERVER_URL,
    shouldPing: true,
    pingInterval: 0,
    pingOnlyIfOffline: false,
    pingInBackground: false,
    httpMethod: DEFAULT_HTTP_METHOD,
  };

  handleConnectivityChange = (isConnected: boolean) => {
    const { isConnected: wasConnected, actionQueue, dispatch } = this.props;

    if (isConnected !== wasConnected) {
      dispatch(connectionChange(isConnected));
    }
    // dispatching queued actions in order of arrival (if we have any)
    if (!wasConnected && isConnected && actionQueue.length > 0) {
      actionQueue.forEach((action: *) => {
        dispatch(action);
      });
    }
  };

  render() {
    const { children } = this.props;
    return (
      <NetworkConnectivity
        {...this.props}
        onConnectivityChange={this.handleConnectivityChange}
      >
        {() => children}
      </NetworkConnectivity>
    );
  }
}

function mapStateToProps(state: { network: NetworkState }) {
  return {
    isConnected: state.network.isConnected,
    actionQueue: state.network.actionQueue,
  };
}

const ConnectedReduxNetworkProvider = connect(mapStateToProps)(
  ReduxNetworkProvider,
);

export {
  ConnectedReduxNetworkProvider as default,
  ReduxNetworkProvider,
  mapStateToProps,
};
