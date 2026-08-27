import { z } from "zod";

const libraryFolderIdSchema = z.string().min(1).max(256);
const libraryFolderItemIdsSchema = z
  .array(libraryFolderIdSchema)
  .max(10_000)
  .superRefine((ids, ctx) => {
    if (new Set(ids).size !== ids.length) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Item IDs must be unique" });
    }
  });
const nonEmptyLibraryFolderItemIdsSchema = z
  .array(libraryFolderIdSchema)
  .min(1)
  .max(10_000)
  .superRefine((ids, ctx) => {
    if (new Set(ids).size !== ids.length) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Item IDs must be unique" });
    }
  });

/**
 * `character-collections` reuses this table rather than adding a parallel
 * schema. A folder is already a named, ordered, scoped list of item IDs; the
 * only difference is that a character may belong to several collections, which
 * is handled by using addItems instead of the exclusive moveItems.
 */
export const libraryFolderScopeSchema = z.enum(["lorebooks", "presets", "agents", "character-collections"]);

export const libraryFolderScopeParamsSchema = z.object({
  scope: libraryFolderScopeSchema,
});

export const libraryFolderParamsSchema = libraryFolderScopeParamsSchema.extend({
  id: libraryFolderIdSchema,
});

export const createLibraryFolderSchema = z.object({
  name: z.string().trim().min(1).max(200),
});

export const updateLibraryFolderSchema = z.object({
  name: z.string().trim().min(1).max(200).optional(),
  collapsed: z.boolean().optional(),
  sortOrder: z.number().int().nonnegative().optional(),
  itemIds: libraryFolderItemIdsSchema.optional(),
});

/** Additive membership: the items join the folder and keep any others. */
export const addLibraryItemsSchema = z.object({
  itemIds: nonEmptyLibraryFolderItemIdsSchema,
  folderId: libraryFolderIdSchema,
});

export const removeLibraryItemsSchema = z.object({
  itemIds: nonEmptyLibraryFolderItemIdsSchema,
  folderId: libraryFolderIdSchema,
});

export const moveLibraryItemsSchema = z.object({
  itemIds: nonEmptyLibraryFolderItemIdsSchema,
  folderId: libraryFolderIdSchema.nullable(),
});

export const migrateLibraryFolderSchema = z.object({
  id: libraryFolderIdSchema,
  name: z.string().trim().min(1).max(200),
  collapsed: z.boolean().optional().default(false),
  sortOrder: z.number().int().nonnegative(),
  itemIds: libraryFolderItemIdsSchema,
});

export const migrateLibraryFoldersSchema = z
  .object({
    folders: z.array(migrateLibraryFolderSchema).max(1_000),
  })
  .superRefine(({ folders }, ctx) => {
    const seen = new Set<string>();
    folders.forEach((folder, index) => {
      if (seen.has(folder.id)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["folders", index, "id"],
          message: "Folder IDs must be unique",
        });
      }
      seen.add(folder.id);
    });
  });

export type LibraryFolderScope = z.infer<typeof libraryFolderScopeSchema>;
export type CreateLibraryFolderInput = z.infer<typeof createLibraryFolderSchema>;
export type UpdateLibraryFolderInput = z.infer<typeof updateLibraryFolderSchema>;
export type MoveLibraryItemsInput = z.infer<typeof moveLibraryItemsSchema>;
export type AddLibraryItemsInput = z.infer<typeof addLibraryItemsSchema>;
export type RemoveLibraryItemsInput = z.infer<typeof removeLibraryItemsSchema>;
export type MigrateLibraryFolderInput = z.infer<typeof migrateLibraryFolderSchema>;
export type MigrateLibraryFoldersInput = z.infer<typeof migrateLibraryFoldersSchema>;
