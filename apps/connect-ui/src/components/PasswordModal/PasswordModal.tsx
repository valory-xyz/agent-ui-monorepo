import { Alert, Button, Flex, Input, Modal, Typography } from 'antd';
import { useState } from 'react';

import { useUpdateSettings } from '../../hooks/useUpdateSettings';
import { SettingsPatch } from '../../types';

const { Text } = Typography;

type PasswordModalProps = {
  title: string;
  body: string;
  confirmLabel: string;
  /** The merge-patch to submit; the password is appended on confirm. */
  patch: Omit<SettingsPatch, 'password'>;
  onClose: () => void;
};

export const PasswordModal = ({
  title,
  body,
  confirmLabel,
  patch,
  onClose,
}: PasswordModalProps) => {
  const [password, setPassword] = useState('');
  const { mutate, isPending, error } = useUpdateSettings();

  const handleConfirm = () => {
    mutate({ ...patch, password }, { onSuccess: onClose });
  };

  return (
    <Modal
      open
      title={title}
      onCancel={onClose}
      footer={[
        <Button key="cancel" onClick={onClose}>
          Cancel
        </Button>,
        <Button
          key="confirm"
          type="primary"
          disabled={!password}
          loading={isPending}
          onClick={handleConfirm}
        >
          {confirmLabel}
        </Button>,
      ]}
    >
      <Flex vertical gap={12}>
        <Text>{body}</Text>
        <label htmlFor="connect-password">
          Enter your password <Text type="danger">*</Text>
        </label>
        <Input.Password
          id="connect-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {error && <Alert type="error" showIcon message={error.message} />}
      </Flex>
    </Modal>
  );
};
