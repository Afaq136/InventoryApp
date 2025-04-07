// QRCodeGenerator.tsx
import React from 'react';
import { View, StyleSheet } from 'react-native';
import QRCode from 'react-native-qrcode-svg';

const QRCodeGenerator = ({ value }: { value: string }) => {
  if (!value) return null; // Ensure the QR code is only rendered when a value is provided

  return (
    <View style={styles.container}>
      <QRCode value={value} size={200} />
    </View>
  );
};

export default QRCodeGenerator;

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginVertical: 20,
  },
});
