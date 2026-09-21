import { gql } from '@apollo/client';

export const CREATE_PRODUCT = gql`
  mutation CreateProduct($input: CreateProductInput!) {
    createProduct(input: $input) {
      id
      name
    }
  }
`;

export const UPDATE_PRODUCT = gql`
  mutation UpdateProduct($input: UpdateProductInput!) {
    updateProduct(input: $input) {
      id
      name
      sku
      barcode
      sellingPrice
      purchasePrice
      balance
    }
  }
`;

export const ASK_ASSISTANT = gql`
  mutation AskInventoryAssistant($message: String!) {
    askInventoryAssistant(message: $message)
  }
`;

export const UPDATE_TELEGRAM_CONFIG = gql`
  mutation UpdateTelegramConfig($botToken: String!, $chatId: String!) {
    updateTelegramConfig(botToken: $botToken, chatId: $chatId)
  }
`;

export const CREATE_SUPPLIER = gql`
  mutation CreateSupplier($input: CreateSupplierInput!) {
    createSupplier(input: $input) {
      id
      name
    }
  }
`;

export const GET_PRODUCTS = gql`
  query GetProducts {
    products {
      id
      name
      sku
      barcode
      sellingPrice
      purchasePrice
      balance
    }
  }
`;

export const GET_DASHBOARD_STATS = gql`
  query GetDashboardStats {
    products {
      id
      name
      balance
      sellingPrice
      purchasePrice
    }
    inventoryHistory {
      id
      type
      quantityChange
      balanceAfter
      createdAt
    }
  }
`;

export const GET_SUPPLIERS = gql`
  query GetSuppliers {
    suppliers {
      id
      name
      contactName
      email
      phone
    }
  }
`;

export const GET_INVENTORY_HISTORY = gql`
  query GetInventoryHistory($productId: ID) {
    inventoryHistory(productId: $productId) {
      id
      type
      quantityChange
      balanceAfter
      createdAt
      product {
        name
      }
    }
  }
`;

export const RECORD_MOVEMENT = gql`
  mutation RecordMovement($productId: ID!, $type: MovementType!, $quantityChange: Float!, $notes: String) {
    recordMovement(productId: $productId, type: $type, quantityChange: $quantityChange, notes: $notes) {
      id
      type
      quantityChange
      balanceAfter
    }
  }
`;

export const GENERATE_AI_CONFIGURATION = gql`
  mutation GenerateAIConfiguration($description: String!) {
    generateAIConfiguration(description: $description)
  }
`;

export const APPROVE_CONFIGURATION = gql`
  mutation ApproveConfiguration($configSchema: Any!) {
    approveConfiguration(configSchema: $configSchema) {
      id
      status
    }
  }
`;
