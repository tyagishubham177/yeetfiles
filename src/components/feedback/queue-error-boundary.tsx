import { Component, type ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { radius, spacing, typography } from '../../constants/ui-tokens';
import { Button } from '../ui/button';

type QueueErrorBoundaryProps = {
  children: ReactNode;
};

type QueueErrorBoundaryState = {
  errorMessage: string | null;
};

export class QueueErrorBoundary extends Component<QueueErrorBoundaryProps, QueueErrorBoundaryState> {
  state: QueueErrorBoundaryState = {
    errorMessage: null,
  };

  static getDerivedStateFromError(error: Error): QueueErrorBoundaryState {
    return {
      errorMessage: error.message,
    };
  }

  handleRetry = () => {
    this.setState({
      errorMessage: null,
    });
  };

  render() {
    if (!this.state.errorMessage) {
      return this.props.children;
    }

    return (
      <View style={styles.wrap}>
        <Text style={styles.eyebrow}>Queue recovery</Text>
        <Text style={styles.title}>Something in the review stack misfired.</Text>
        <Text style={styles.body}>{this.state.errorMessage}</Text>
        <Button label="Reload queue surface" onPress={this.handleRetry} />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  wrap: {
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    padding: spacing.xl,
    gap: spacing.md,
    backgroundColor: 'rgba(8,12,20,0.56)',
  },
  eyebrow: {
    color: 'rgba(249,250,251,0.72)',
    fontFamily: typography.medium,
    fontSize: 12,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  title: {
    color: '#FFFFFF',
    fontFamily: typography.display,
    fontSize: 28,
  },
  body: {
    color: 'rgba(249,250,251,0.82)',
    fontFamily: typography.body,
    fontSize: 15,
    lineHeight: 24,
  },
});
