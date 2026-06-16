import prisma from "../../config/prisma.js";
import AppError from "../../utils/appError.js";

/**
 * Returns all projects the user owns or is a member of,
 * including aggregate counts.
 */
export async function getProjectsForUser(userId) {
  const projects = await prisma.project.findMany({
    where: {
      OR: [
        { ownerId: userId },
        { members: { some: { userId } } },
      ],
    },
    include: {
      owner: { select: { id: true, username: true } },
      _count: { select: { rooms: true, members: true } },
      members: {
        select: { userId: true, role: true },
        take: 5,
      },
    },
    orderBy: { updatedAt: "desc" },
  });

  return projects.map((p) => ({
    id: p.id,
    name: p.name,
    description: p.description,
    tags: p.tags,
    ownerId: p.ownerId,
    ownerName: p.owner.username,
    roomCount: p._count.rooms,
    memberCount: p._count.members,
    members: p.members,
    createdAt: p.createdAt,
    updatedAt: p.updatedAt,
  }));
}

/**
 * Returns a single project by ID with its rooms and members.
 */
export async function getProjectById(id, userId) {
  const project = await prisma.project.findUnique({
    where: { id },
    include: {
      owner: { select: { id: true, username: true } },
      members: {
        include: { user: { select: { id: true, username: true } } },
        orderBy: { joinedAt: "asc" },
      },
      rooms: {
        include: {
          createdBy: { select: { id: true, username: true } },
          _count: { select: { participants: true } },
        },
        orderBy: { lastActivityAt: "desc" },
      },
    },
  });

  if (!project) throw new AppError("Project not found.", 404);

  // Check access: owner or member
  const isMember =
    project.ownerId === userId ||
    project.members.some((m) => m.userId === userId);

  if (!isMember) {
    throw new AppError("You do not have access to this project.", 403);
  }

  return {
    ...project,
    ownerName: project.owner.username,
    rooms: project.rooms.map((r) => ({
      id: r.id,
      name: r.name,
      code: r.code,
      status: r.status,
      createdBy: r.createdById,
      projectId: r.projectId,
      participants: r._count.participants,
      createdAt: r.createdAt.toISOString(),
      lastActivity: r.lastActivityAt.toISOString(),
      lastActivityAt: r.lastActivityAt.toISOString(),
      lastUpdated: r.updatedAt.toISOString(),
      endedAt: r.endedAt?.toISOString() || null,
    })),
  };

}

/**
 * Creates a new project. The creator becomes OWNER in ProjectMember.
 */
export async function createProject({ name, description, tags }, userId) {
  if (!name || !name.trim()) {
    throw new AppError("Project name is required.", 400);
  }

  const project = await prisma.project.create({
    data: {
      name: name.trim(),
      description: description?.trim() || null,
      tags: Array.isArray(tags) ? tags.map((t) => t.trim()).filter(Boolean) : [],
      ownerId: userId,
      members: {
        create: { userId, role: "OWNER" },
      },
    },
    include: {
      owner: { select: { id: true, username: true } },
      _count: { select: { rooms: true, members: true } },
    },
  });

  return {
    id: project.id,
    name: project.name,
    description: project.description,
    tags: project.tags,
    ownerId: project.ownerId,
    ownerName: project.owner.username,
    roomCount: project._count.rooms,
    memberCount: project._count.members,
    createdAt: project.createdAt,
    updatedAt: project.updatedAt,
  };
}

/**
 * Updates a project. Owner only.
 */
export async function updateProject(id, { name, description, tags }, userId) {
  const project = await prisma.project.findUnique({ where: { id } });
  if (!project) throw new AppError("Project not found.", 404);
  if (project.ownerId !== userId) {
    throw new AppError("Only the project owner can edit this project.", 403);
  }

  const data = {};
  if (name !== undefined) data.name = name.trim();
  if (description !== undefined) data.description = description?.trim() || null;
  if (tags !== undefined) data.tags = Array.isArray(tags) ? tags.map((t) => t.trim()).filter(Boolean) : [];

  const updated = await prisma.project.update({
    where: { id },
    data,
    include: {
      owner: { select: { id: true, username: true } },
      _count: { select: { rooms: true, members: true } },
    },
  });

  return {
    id: updated.id,
    name: updated.name,
    description: updated.description,
    tags: updated.tags,
    ownerId: updated.ownerId,
    ownerName: updated.owner.username,
    roomCount: updated._count.rooms,
    memberCount: updated._count.members,
    createdAt: updated.createdAt,
    updatedAt: updated.updatedAt,
  };
}

/**
 * Deletes a project. Owner only.
 * Rooms linked to this project will have projectId set to null (onDelete: SetNull).
 */
export async function deleteProject(id, userId) {
  const project = await prisma.project.findUnique({ where: { id } });
  if (!project) throw new AppError("Project not found.", 404);
  if (project.ownerId !== userId) {
    throw new AppError("Only the project owner can delete this project.", 403);
  }

  await prisma.project.delete({ where: { id } });
  return { message: "Project deleted." };
}
