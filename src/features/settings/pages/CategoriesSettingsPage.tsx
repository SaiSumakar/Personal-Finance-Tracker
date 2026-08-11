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

import { Colors, ACCOUNT_COLORS } from "../../../theme/colors";
import { Spacing } from "../../../theme/spacing";
import { Typography } from "../../../theme/typography";

import { useCategoryStore } from "../../categories/stores/categoryStore";
import type { Category } from "../../categories/types/category";

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
          <View style={styles.categorySection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>
                {categoryLabel}
              </Text>

              <Text style={styles.categoryCount}>
                {categories.length}
              </Text>
            </View>

            <View style={styles.categoryList}>
              {categories.map((category) => (
                <Pressable
                  style={({ pressed }) => [
                    styles.categoryCard,
                    pressed && styles.categoryCardPressed,
                  ]}
                  key={category.id}
                  onPress={() => openEditModal(category)}
                  android_ripple={{
                    color: "rgba(0, 0, 0, 0.035)",
                  }}
                >
                  <View
                    style={[
                      styles.categoryAccent,
                      {
                        backgroundColor:
                          category.color ??
                          Colors.textSecondary,
                      },
                    ]}
                  />

                  <View style={styles.categoryContent}>
                    <View style={styles.categoryDetails}>
                      <Text
                        style={styles.categoryName}
                        numberOfLines={1}
                      >
                        {category.name}
                      </Text>

                      <View style={styles.categoryMeta}>
                        <Text style={styles.categoryType}>
                          {category.type}
                        </Text>

                        <View style={styles.metaDot} />

                        <Text style={styles.categoryHint}>
                          Category
                        </Text>
                      </View>
                    </View>
                  </View>

                  <Pressable
                    style={({ pressed }) => [
                      styles.deleteButton,
                      pressed && styles.deleteButtonPressed,
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
                      size={18}
                      color="#D9534F"
                    />
                  </Pressable>
                </Pressable>
              ))}
            </View>
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
              <View style={styles.modalHeaderText}>
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
                style={({ pressed }) => [
                  styles.closeButton,
                  pressed && styles.closeButtonPressed,
                ]}
                onPress={closeCategoryModal}
                hitSlop={8}
              >
                <Ionicons
                  name="close"
                  size={21}
                  color={Colors.text}
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
                          styles.colorOptionOuter,
                          isSelected &&
                            styles.colorOptionSelected,
                        ]}
                        onPress={() =>
                          setSelectedColor(color)
                        }
                        accessibilityRole="button"
                        accessibilityLabel={`Select color ${color}`}
                      >
                        <View
                          style={[
                            styles.colorOption,
                            {
                              backgroundColor: color,
                            },
                          ]}
                        />

                        {isSelected && (
                          <Ionicons
                            name="checkmark"
                            size={16}
                            color="#FFFFFF"
                            style={styles.colorCheck}
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

  categorySection: {
    marginTop: 2,
  },

  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },

  sectionTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: Colors.textSecondary,
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },

  categoryCount: {
    minWidth: 24,
    height: 24,
    paddingHorizontal: 7,
    borderRadius: 12,
    textAlign: "center",
    textAlignVertical: "center",
    fontSize: 11,
    fontWeight: "700",
    color: Colors.textSecondary,
    backgroundColor:
      Colors.surface ?? "rgba(0, 0, 0, 0.05)",
  },

  categoryList: {
    gap: 10,
  },

  categoryCard: {
    minHeight: 82,
    borderRadius: 16,
    backgroundColor:
      Colors.surface ?? "rgba(0, 0, 0, 0.025)",
    borderWidth: 1,
    borderColor:
      Colors.border ?? "rgba(0, 0, 0, 0.08)",
    flexDirection: "row",
    alignItems: "center",
    overflow: "hidden",
  },

  categoryCardPressed: {
    opacity: 0.78,
  },

  categoryAccent: {
    width: 4,
    alignSelf: "stretch",
  },

  categoryContent: {
    flex: 1,
    minWidth: 0,
    flexDirection: "row",
    alignItems: "center",
    paddingLeft: 14,
    paddingVertical: 14,
  },

  categoryDetails: {
    flex: 1,
    minWidth: 0,
    paddingRight: 10,
  },

  categoryName: {
    fontSize: Typography.body,
    fontWeight: "700",
    color: Colors.text,
    marginBottom: 5,
  },

  categoryMeta: {
    flexDirection: "row",
    alignItems: "center",
  },

  categoryType: {
    fontSize: 12,
    color: Colors.textSecondary,
    textTransform: "capitalize",
  },

  metaDot: {
    width: 3,
    height: 3,
    borderRadius: 2,
    backgroundColor: Colors.textSecondary,
    marginHorizontal: 7,
    opacity: 0.6,
  },

  categoryHint: {
    fontSize: 12,
    fontWeight: "600",
    color: Colors.textSecondary,
  },

  deleteButton: {
    width: 45,
    height: 45,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 7,
  },

  deleteButtonPressed: {
    backgroundColor: "rgba(217, 83, 79, 0.10)",
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
    backgroundColor: "rgba(0, 0, 0, 0.45)",
  },

  modalContainer: {
    backgroundColor: Colors.background,
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    maxHeight: "92%",
    paddingTop: 8,
    overflow: "hidden",
  },

  modalHandle: {
    width: 38,
    height: 4,
    borderRadius: 4,
    alignSelf: "center",
    backgroundColor: Colors.textSecondary,
    opacity: 0.3,
    marginBottom: 15,
  },

  modalHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingHorizontal: Spacing.lg,
    paddingBottom: 17,
  },

  modalHeaderText: {
    flex: 1,
    paddingRight: 12,
  },

  modalTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: Colors.text,
    marginBottom: 4,
  },

  modalSubtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 19,
  },

  closeButton: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor:
      Colors.surface ?? "rgba(0, 0, 0, 0.05)",
  },

  closeButtonPressed: {
    opacity: 0.6,
  },

  formContent: {
    paddingHorizontal: Spacing.lg,
    paddingTop: 2,
    paddingBottom: 34,
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
    gap: 13,
  },

  colorOptionOuter: {
    width: 40,
    height: 40,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
  },

  colorOptionSelected: {
    borderWidth: 2,
    borderColor: Colors.text,
  },

  colorOptionPressed: {
    opacity: 0.7,
  },

  colorOption: {
    width: 28,
    height: 28,
    borderRadius: 9,
  },

  colorCheck: {
    position: "absolute",
  },

  /* Modal save button */

  modalAddButton: {
    height: 52,
    borderRadius: 15,
    backgroundColor:
      Colors.primary ?? "#4F46E5",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 3,
  },

  modalAddButtonPressed: {
    opacity: 0.86,
  },

  modalAddButtonDisabled: {
    opacity: 0.55,
  },

  modalAddButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },
});