import { Ionicons } from "@expo/vector-icons";
import {
  Dimensions,
  LayoutRectangle,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useRef } from "react";

import { Colors } from "../../../theme/colors";
import { Spacing } from "../../../theme/spacing";
import { Typography } from "../../../theme/typography";

type Option = {
  label: string;
  value: string;
};

type SettingsDropdownProps = {
  value: string;
  options: Option[];
  open: boolean;
  position?: LayoutRectangle;
  onOpen: (layout: LayoutRectangle) => void;
  onSelect: (value: string) => void;
  onClose: () => void;
};

export default function SettingsDropdown({
  value,
  options,
  open,
  position,
  onOpen,
  onSelect,
  onClose,
}: SettingsDropdownProps) {
  const triggerRef = useRef<View | null>(null);

  return (
    <>
      {/* Trigger */}
      <View ref={triggerRef} collapsable={false}>
        <Pressable
          onPress={(event) => {
            event.stopPropagation();

            triggerRef.current?.measureInWindow(
              (x, y, width, height) => {
                onOpen({ x, y, width, height });
              }
            );
          }}
          style={({ pressed }) => [
            styles.trigger,
            pressed && styles.triggerPressed,
            open && styles.triggerOpen,
          ]}
        >
          <Text style={styles.triggerText}>
            {value}
          </Text>

          <Ionicons
            name={open ? "chevron-up" : "chevron-down"}
            size={16}
            color={Colors.textSecondary}
          />
        </Pressable>
      </View>

      {/* Dropdown */}
      {open && position && (
        <Modal
          visible
          transparent
          animationType="none"
          onRequestClose={onClose}
        >
          <Pressable
            style={styles.modalOverlay}
            onPress={onClose}
          >
            <View
              style={[
                styles.menu,
                {
                  position: "absolute",
                  top: position.y + position.height + 6,
                  left: Math.min(
                    position.x,
                    Math.max(
                      0,
                      Dimensions.get("window").width -
                        Math.max(position.width, 150) -
                        16
                    )
                  ),
                  minWidth: Math.max(position.width, 150),
                },
              ]}
            >
              {options.map((option, index) => {
                const selected = option.value === value;

                return (
                  <Pressable
                    key={option.value}
                    onPress={(event) => {
                      event.stopPropagation();
                      onSelect(option.value);
                      onClose();
                    }}
                    style={({ pressed }) => [
                      styles.option,
                      selected && styles.optionSelected,
                      pressed && styles.optionPressed,
                      index === options.length - 1 && styles.lastOption,
                    ]}
                  >
                    <Text
                      style={[
                        styles.optionText,
                        selected && styles.optionTextSelected,
                      ]}
                    >
                      {option.label}
                    </Text>

                    {selected && (
                      <Ionicons
                        name="checkmark"
                        size={17}
                        color={Colors.primary}
                      />
                    )}
                  </Pressable>
                );
              })}
            </View>
          </Pressable>
        </Modal>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  trigger: {
    minWidth: 105,
    height: 38,
    paddingHorizontal: 11,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,

    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",

    gap: 8,
  },

  triggerOpen: {
    borderColor: Colors.primary,
  },

  triggerPressed: {
    opacity: 0.75,
  },

  triggerText: {
    fontSize: 12,
    fontWeight: "600",
    color: Colors.text,
  },

  menu: {
    position: "absolute",

    minWidth: 150,

    backgroundColor: Colors.surface,

    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,

    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.12,
    shadowRadius: 10,

    elevation: 8,

    overflow: "hidden",

    zIndex: 1000,
  },

  option: {
    minHeight: 44,
    paddingHorizontal: Spacing.md,

    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",

    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.border,
  },

  lastOption: {
    borderBottomWidth: 0,
  },

  optionSelected: {
    backgroundColor: Colors.primaryLight,
  },

  optionPressed: {
    opacity: 0.7,
  },

  optionText: {
    fontSize: Typography.body,
    color: Colors.text,
  },

  optionTextSelected: {
    color: Colors.primary,
    fontWeight: "600",
  },

  modalOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: "transparent",
  },
});