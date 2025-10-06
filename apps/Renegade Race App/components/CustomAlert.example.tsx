import { AlertTriangle, Check, Info, X } from 'lucide-react-native';
import React, { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import CustomAlert from './CustomAlert';

// Example usage of CustomAlert component
export const CustomAlertExamples = () => {
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [showErrorAlert, setShowErrorAlert] = useState(false);
  const [showInfoAlert, setShowInfoAlert] = useState(false);
  const [showConfirmAlert, setShowConfirmAlert] = useState(false);

  return (
    <View style={{ flex: 1, padding: 20, gap: 16 }}>
      <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 20 }}>
        CustomAlert Examples
      </Text>

      {/* Success Alert */}
      <Pressable
        style={{
          backgroundColor: '#10B981',
          padding: 16,
          borderRadius: 8,
          alignItems: 'center',
        }}
        onPress={() => setShowSuccessAlert(true)}
      >
        <Text style={{ color: 'white', fontWeight: '600' }}>
          Show Success Alert
        </Text>
      </Pressable>

      {/* Error Alert */}
      <Pressable
        style={{
          backgroundColor: '#EF4444',
          padding: 16,
          borderRadius: 8,
          alignItems: 'center',
        }}
        onPress={() => setShowErrorAlert(true)}
      >
        <Text style={{ color: 'white', fontWeight: '600' }}>
          Show Error Alert
        </Text>
      </Pressable>

      {/* Info Alert */}
      <Pressable
        style={{
          backgroundColor: '#3B82F6',
          padding: 16,
          borderRadius: 8,
          alignItems: 'center',
        }}
        onPress={() => setShowInfoAlert(true)}
      >
        <Text style={{ color: 'white', fontWeight: '600' }}>
          Show Info Alert
        </Text>
      </Pressable>

      {/* Confirmation Alert */}
      <Pressable
        style={{
          backgroundColor: '#F59E0B',
          padding: 16,
          borderRadius: 8,
          alignItems: 'center',
        }}
        onPress={() => setShowConfirmAlert(true)}
      >
        <Text style={{ color: 'white', fontWeight: '600' }}>
          Show Confirmation Alert
        </Text>
      </Pressable>

      {/* Success Alert */}
      <CustomAlert
        visible={showSuccessAlert}
        title="Success!"
        message="Your action was completed successfully."
        icon={<Check size={32} color="#10B981" />}
        onConfirm={() => setShowSuccessAlert(false)}
        confirmText="Got it"
      />

      {/* Error Alert */}
      <CustomAlert
        visible={showErrorAlert}
        title="Error"
        message="Something went wrong. Please try again."
        icon={<X size={32} color="#EF4444" />}
        onConfirm={() => setShowErrorAlert(false)}
        confirmText="OK"
      />

      {/* Info Alert */}
      <CustomAlert
        visible={showInfoAlert}
        title="Information"
        message="This is an informational message for the user."
        icon={<Info size={32} color="#3B82F6" />}
        onConfirm={() => setShowInfoAlert(false)}
        confirmText="Understood"
      />

      {/* Confirmation Alert */}
      <CustomAlert
        visible={showConfirmAlert}
        title="Confirm Action"
        message="Are you sure you want to proceed with this action?"
        icon={<AlertTriangle size={32} color="#F59E0B" />}
        onCancel={() => setShowConfirmAlert(false)}
        onConfirm={() => {
          setShowConfirmAlert(false);
          // Handle confirmation logic here
        }}
        confirmText="Yes, Proceed"
        cancelText="Cancel"
      />
    </View>
  );
};

export default CustomAlertExamples;
