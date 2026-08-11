import { useEffect, useState } from "react";

import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";

import { Colors } from "../../constants/colors";
import { Spacing } from "../../constants/spacing";
import { Typography } from "../../constants/typography";

import { useCategoryStore } from "../../stores/categoryStore";
import type { Category } from "../../types/category";

// Adjust this import path to wherever ACCOUNT_COLORS is defined.
import { ACCOUNT_COLORS } from "../../constants/colors";

export default function CategorySettingsPage() {
  const expenseCategories = useCategoryStore(
    (state) => state.expenseCategories
  );

  const incomeCategories = useCategoryStore(
    (state) => state.incomeCategories
  );

  const loadCategories = useCategoryStore(
    (state) => state.loadCategories
  );

  const addCategory = useCategoryStore(
    (state) => state.addCategory
  );

  const updateCategory = useCategoryStore(
    (state) => state.updateCategory
  );

  const deleteCategory = useCategoryStore(
    (state) => state.deleteCategory
  );

  const [selectedType, setSelectedType] = useState<
    "expense" | "income"
  >("expense");

  // -----------------------------
  // Modal state
  // -----------------------------

  const [editingCategoryId, setEditingCategoryId] =
    useState<number | null>(null);

  const [isCategoryModalVisible, setIsCategoryModalVisible] =
    useState(false);

  const [name, setName] = useState("");

  const [type, setType] = useState<
    "expense" | "income"
  >("expense");

  const [selectedColor, setSelectedColor] = useState(
    ACCOUNT_COLORS[0]
  );

  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  const categories =
    selectedType === "expense"
      ? expenseCategories
      : incomeCategories;

  const categoryLabel =
    selectedType === "expense" ? "Expense" : "Income";

  // -----------------------------
  // Form helpers
  // -----------------------------

  const resetForm = () => {
    setName("");
    setType(selectedType);
    setSelectedColor(ACCOUNT_COLORS[0]);
  };

  const openAddModal = () => {
    resetForm();

    // New category follows whichever tab
    // the user is currently viewing.
    setType(selectedType);

    setEditingCategoryId(null);
    setIsCategoryModalVisible(true);
  };

  const openEditModal = (category: Category) => {
    setEditingCategoryId(category.id);

    setName(category.name);

    setType(category.type);

    setSelectedColor(
      category.color ?? ACCOUNT_COLORS[0]
    );

    setIsCategoryModalVisible(true);
  };

  const closeCategoryModal = () => {
    if (isSaving) {
      return;
    }

    setIsCategoryModalVisible(false);
    setEditingCategoryId(null);
  };

  // -----------------------------
  // Save
  // -----------------------------

  const handleSaveCategory = async () => {
    const trimmedName = name.trim();

    if (!trimmedName) {
      Alert.alert(
        "Missing name",
        "Please enter a category name."
      );
      return;
    }

    try {
      setIsSaving(true);

      if (editingCategoryId === null) {
        // ADD
        const success = await addCategory({
          name: trimmedName,
          type,
          color: selectedColor,
          icon: null,
        });

        if (!success) {
          Alert.alert(
            "Couldn't add category",
            "Something went wrong while adding the category."
          );
          return;
        }
      } else {
        // EDIT
        const success = await updateCategory(
          editingCategoryId,
          {
            name: trimmedName,
            type,
            color: selectedColor,
          }
        );

        if (!success) {
          Alert.alert(
            "Couldn't save category",
            "Something went wrong while saving the category."
          );
          return;
        }
      }

      setIsCategoryModalVisible(false);
      setEditingCategoryId(null);
      resetForm();

      await loadCategories();
    } catch (error) {
      Alert.alert(
        "Couldn't save category",
        "Something went wrong while saving the category."
      );
    } finally {
      setIsSaving(false);
    }
  };

  // -----------------------------
  // Delete
  // -----------------------------

  const handleDeleteCategory = (
    categoryId: number,
    categoryName: string
  ) => {
    Alert.alert(
      "Delete category?",
      `Are you sure you want to delete "${categoryName}"?`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            await deleteCategory(categoryId);
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.subtitle}>
            Manage your categories used for tracking
            transactions.
          </Text>
        </View>

        {/* Expense / Income selector */}
        <View style={styles.selector}>
          <Pressable
            style={[
              styles.selectorOption,
              selectedType === "expense" &&
                styles.selectorOptionSelected,
            ]}
            onPress={() => setSelectedType("expense")}
          >
            <Text
              style={[
                styles.selectorText,
                selectedType === "expense" &&
                  styles.selectorTextSelected,
              ]}
            >
              Expense
            </Text>
          </Pressable>

          <Pressable
            style={[
              styles.selectorOption,
              selectedType === "income" &&
                styles.selectorOptionSelected,
            ]}
            onPress={() => setSelectedType("income")}
          >
            <Text
              style={[
                styles.selectorText,
                selectedType === "income" &&
                  styles.selectorTextSelected,
              ]}
            >
              Income
            </Text>
          </Pressable>
        </View>

        {/* Category list */}
        {categories.length === 0 ? (
          <View style={styles.emptyState}>
            <View style={styles.emptyIcon}>
              <Ionicons
                name="pricetag-outline"
                size={23}
                color={Colors.textSecondary}
              />
            </View>

            <Text style={styles.emptyTitle}>
              No {categoryLabel.toLowerCase()} categories yet
            </Text>

            <Text style={styles.emptyDescription}>
              Add categories to get started
            </Text>
          </View>
        ) : (
          <View style={styles.categoryList}>
            {categories.map((category) => (
              <Pressable
                style={styles.categoryRow}
                key={category.id}
                onPress={() => openEditModal(category)}
                android_ripple={{
                  color: "rgba(0, 0, 0, 0.04)",
                }}
              >
                <View
                  style={[
                    styles.categoryIndicator,
                    {
                      backgroundColor:
                        category.color ??
                        Colors.textSecondary,
                    },
                  ]}
                />

                <View style={styles.categoryInfo}>
                  <Text
                    style={styles.categoryName}
                    numberOfLines={1}
                  >
                    {category.name}
                  </Text>

                  <Text style={styles.categoryType}>
                    {category.type}
                  </Text>
                </View>

                <Pressable
                  style={({ pressed }) => [
                    styles.deleteButton,
                    pressed &&
                      styles.deleteButtonPressed,
                  ]}
                  hitSlop={8}
                  onPress={() =>
                    handleDeleteCategory(
                      category.id,
                      category.name
                    )
                  }
                  accessibilityRole="button"
                  accessibilityLabel={`Delete ${category.name}`}
                >
                  <Ionicons
                    name="trash-outline"
                    size={19}
                    color="#D9534F"
                  />
                </Pressable>
              </Pressable>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Fixed add button */}
      <View style={styles.bottomAction}>
        <Pressable
          style={({ pressed }) => [
            styles.addButton,
            pressed && styles.addButtonPressed,
          ]}
          onPress={openAddModal}
        >
          <Ionicons
            name="add"
            size={21}
            color="#FFFFFF"
          />

          <Text style={styles.addButtonText}>
            Add {categoryLabel}
          </Text>
        </Pressable>
      </View>

      {/* Category Modal */}
      <Modal
        visible={isCategoryModalVisible}
        transparent
        animationType="slide"
        onRequestClose={closeCategoryModal}
      >
        <KeyboardAvoidingView
          style={styles.modalRoot}
          behavior={
            Platform.OS === "ios"
              ? "padding"
              : undefined
          }
        >
          <Pressable
            style={styles.modalBackdrop}
            onPress={closeCategoryModal}
          />

          <View style={styles.modalContainer}>
            <View style={styles.modalHandle} />

            {/* Modal header */}
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>
                  {editingCategoryId === null
                    ? "Add category"
                    : "Edit category"}
                </Text>

                <Text style={styles.modalSubtitle}>
                  {editingCategoryId === null
                    ? "Add a category to organize your transactions."
                    : "Update your category details."}
                </Text>
              </View>

              <Pressable
                style={styles.closeButton}
                onPress={closeCategoryModal}
                hitSlop={8}
              >
                <Ionicons
                  name="close"
                  size={22}
                  color={Colors.textSecondary}
                />
              </Pressable>
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={
                styles.formContent
              }
            >
              {/* Name */}
              <View style={styles.field}>
                <Text style={styles.label}>
                  Name
                </Text>

                <TextInput
                  value={name}
                  onChangeText={setName}
                  placeholder="e.g. Food & Dining"
                  placeholderTextColor={
                    Colors.textSecondary
                  }
                  style={styles.input}
                  autoCapitalize="words"
                  returnKeyType="next"
                />
              </View>

              {/* Type */}
              <View style={styles.field}>
                <Text style={styles.label}>
                  Type
                </Text>

                <View
                  style={[
                    styles.input,
                    styles.disabledInput,
                  ]}
                >
                  <Text style={styles.disabledInputText}>
                    {type === "expense" ? "Expense" : "Income"}
                  </Text>
                </View>
              </View>

              {/* Color */}
              <View style={styles.field}>
                <Text style={styles.label}>
                  Color
                </Text>

                <View style={styles.colorGrid}>
                  {ACCOUNT_COLORS.map((color) => {
                    const isSelected =
                      selectedColor === color;

                    return (
                      <Pressable
                        key={color}
                        style={[
                          styles.colorOption,
                          {
                            backgroundColor: color,
                          },
                          isSelected &&
                            styles.colorOptionSelected,
                        ]}
                        onPress={() =>
                          setSelectedColor(color)
                        }
                        accessibilityRole="button"
                        accessibilityLabel={`Select color ${color}`}
                      >
                        {isSelected && (
                          <Ionicons
                            name="checkmark"
                            size={18}
                            color="#FFFFFF"
                          />
                        )}
                      </Pressable>
                    );
                  })}
                </View>
              </View>

              {/* Save */}
              <Pressable
                style={({ pressed }) => [
                  styles.modalAddButton,
                  pressed &&
                    styles.modalAddButtonPressed,
                  isSaving &&
                    styles.modalAddButtonDisabled,
                ]}
                onPress={handleSaveCategory}
                disabled={isSaving}
              >
                <Text
                  style={styles.modalAddButtonText}
                >
                  {isSaving
                    ? editingCategoryId === null
                      ? "Adding..."
                      : "Saving..."
                    : editingCategoryId === null
                      ? "Add category"
                      : "Save changes"}
                </Text>
              </Pressable>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },

  scrollView: {
    flex: 1,
  },

  content: {
    padding: Spacing.lg,
    paddingBottom: 110,
  },

  header: {
    marginBottom: Spacing.lg,
  },

  subtitle: {
    fontSize: Typography.body,
    color: Colors.textSecondary,
    lineHeight: 22,
  },

  /* Expense / Income selector */

  selector: {
    flexDirection: "row",
    padding: 4,
    borderRadius: 14,
    backgroundColor:
      Colors.surface ?? "rgba(0, 0, 0, 0.05)",
    marginBottom: Spacing.xl,
  },

  selectorOption: {
    flex: 1,
    height: 44,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
  },

  selectorOptionSelected: {
    backgroundColor: Colors.background,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 4,
    shadowOffset: {
      width: 0,
      height: 1,
    },
    elevation: 2,
  },

  selectorText: {
    fontSize: Typography.body,
    fontWeight: "500",
    color: Colors.textSecondary,
  },

  selectorTextSelected: {
    fontWeight: "700",
    color: Colors.text,
  },

  /* Category list */

  categoryList: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor:
      Colors.border ?? Colors.textSecondary,
  },

  categoryRow: {
    minHeight: 68,
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth:
      StyleSheet.hairlineWidth,
    borderBottomColor:
      Colors.border ?? Colors.textSecondary,
  },

  categoryIndicator: {
    width: 4,
    height: 42,
    borderRadius: 2,
    marginRight: Spacing.md,
  },

  categoryInfo: {
    flex: 1,
    minWidth: 0,
  },

  categoryName: {
    fontSize: Typography.body,
    fontWeight: "600",
    color: Colors.text,
  },

  categoryType: {
    marginTop: 3,
    fontSize: 13,
    color: Colors.textSecondary,
    textTransform: "capitalize",
  },

  deleteButton: {
    width: 38,
    height: 38,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 19,
    marginLeft: Spacing.sm,
  },

  deleteButtonPressed: {
    backgroundColor: "rgba(255, 0, 0, 0.08)",
  },

  /* Empty state */

  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing.xxxl,
  },

  emptyIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: Colors.textSecondary,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.md,
  },

  emptyTitle: {
    fontSize: Typography.body,
    fontWeight: "600",
    color: Colors.text,
    marginBottom: Spacing.xs,
  },

  emptyDescription: {
    fontSize: Typography.body,
    color: Colors.textSecondary,
  },

  /* Fixed bottom button */

  bottomAction: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom:
      Platform.OS === "ios"
        ? Spacing.xl
        : Spacing.lg,
    backgroundColor: Colors.background,
    borderTopWidth:
      StyleSheet.hairlineWidth,
    borderTopColor:
      Colors.border ?? Colors.textSecondary,
  },

  addButton: {
    height: 52,
    borderRadius: 14,
    backgroundColor:
      Colors.primary ?? "#4F46E5",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },

  addButtonPressed: {
    opacity: 0.85,
  },

  addButtonText: {
    color: "#FFFFFF",
    fontSize: Typography.body,
    fontWeight: "700",
  },

  /* Modal */

  modalRoot: {
    flex: 1,
    justifyContent: "flex-end",
  },

  modalBackdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: "rgba(0, 0, 0, 0.35)",
  },

  modalContainer: {
    maxHeight: "90%",
    backgroundColor: Colors.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: Spacing.sm,
  },

  modalHandle: {
    alignSelf: "center",
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor:
      Colors.border ?? "rgba(0, 0, 0, 0.12)",
    marginBottom: Spacing.md,
  },

  modalHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.lg,
  },

  modalTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: Colors.text,
    marginBottom: 4,
  },

  modalSubtitle: {
    maxWidth: 280,
    fontSize: 14,
    lineHeight: 20,
    color: Colors.textSecondary,
  },

  closeButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
  },

  formContent: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: 32,
  },

  field: {
    marginBottom: Spacing.lg,
  },

  label: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.text,
    marginBottom: Spacing.sm,
  },

  input: {
    minHeight: 52,
    borderWidth: 1,
    borderColor:
      Colors.border ?? "rgba(0, 0, 0, 0.12)",
    borderRadius: 14,
    paddingHorizontal: 16,
    fontSize: Typography.body,
    color: Colors.text,
    backgroundColor:
      Colors.surface ?? Colors.background,
  },

  dropdownButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  dropdownValue: {
    fontSize: Typography.body,
    color: Colors.text,
    textTransform: "capitalize",
  },

  dropdownMenu: {
    marginTop: 6,
    borderWidth: 1,
    borderColor:
      Colors.border ?? "rgba(0, 0, 0, 0.12)",
    borderRadius: 14,
    overflow: "hidden",
    backgroundColor: Colors.background,
  },

  typeOption: {
    minHeight: 48,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  typeOptionPressed: {
    backgroundColor: "rgba(0, 0, 0, 0.04)",
  },

  typeOptionSelected: {
    backgroundColor: "rgba(0, 0, 0, 0.035)",
  },

  typeOptionText: {
    fontSize: Typography.body,
    color: Colors.text,
    textTransform: "capitalize",
  },

  typeOptionTextSelected: {
    fontWeight: "600",
  },

  disabledInput: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor:
      Colors.surface ?? "rgba(0, 0, 0, 0.04)",
  },

  disabledInputText: {
    fontSize: Typography.body,
    color: Colors.textSecondary,
  },

  /* Color */

  colorGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },

  colorOption: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
  },

  colorOptionSelected: {
    borderWidth: 3,
    borderColor: Colors.background,
    shadowColor: "#000",
    shadowOpacity: 0.18,
    shadowRadius: 4,
    shadowOffset: {
      width: 0,
      height: 1,
    },
    elevation: 3,
  },

  /* Modal save button */

  modalAddButton: {
    height: 52,
    borderRadius: 14,
    backgroundColor:
      Colors.primary ?? "#4F46E5",
    alignItems: "center",
    justifyContent: "center",
    marginTop: Spacing.sm,
  },

  modalAddButtonPressed: {
    opacity: 0.85,
  },

  modalAddButtonDisabled: {
    opacity: 0.6,
  },

  modalAddButtonText: {
    color: "#FFFFFF",
    fontSize: Typography.body,
    fontWeight: "700",
  },
});