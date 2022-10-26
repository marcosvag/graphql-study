import { arg, extendType, intArg, nonNull, objectType, stringArg } from "nexus";
import { ensureAuthMutation } from "../utils/auth"

export const Link = objectType({
    name: "Link",
    definition(t) {
        t.nonNull.string("description");
        t.nonNull.int("id");
        t.nonNull.string("url");
        t.nonNull.dateTime("createdAt");
        t.nonNull.field("postedBy", {
            type: "User",
            resolve(parent, args, context) {
                return context.prisma.link
                    .findUnique({ where: { id: parent.id } })
                    .postedBy();
            }
        });
        t.nonNull.list.nonNull.field("voters", {
            type: "User",
            resolve(parent, args, context) {
                return context.prisma.link
                    .findUnique({
                        where: {
                            id: parent.id
                        }
                    })
                    .voters();
            }
        })
    },
});

export const LinkQuery = extendType({
    type: "Query",
    definition(t) {
        t.nonNull.list.nonNull.field("feed", {
            type: "Link",
            args: {
                filter: stringArg(),
                skip: intArg(),
                take: intArg(),
            },
            resolve(parent, args, context, info) {
                const where = args.filter ? {
                    OR: [
                    { description: { contains: args.filter } },
                    { url: { contains: args.filter } },
                    { postedBy: {
                        name: { contains: args.filter }},
                    }],
                }
                    : {};
                return context.prisma.link.findMany({ 
                    where, 
                    skip: args?.skip as number | undefined,
                    take: args?.take as number | undefined,
                });
            }
        });
    },
});

export const LinkMutation = extendType({
    type: "Mutation",
    definition(t) {
        t.nonNull.field("post", {
            type: "Link",
            args: {
                description: nonNull(stringArg()),
                url: nonNull(stringArg()),
            },
            resolve(parent, args, context) {
                ensureAuthMutation(context, "post");

                const { description, url } = args;
                const { userId } = context;

                const newLink = context.prisma.link.create({
                    data: {
                        description,
                        url,
                        postedBy: { connect: { id: userId } }
                    }
                });
                return newLink;
            }
        });
    },
});

export const singleLinkQuery = extendType({
    type: "Query",
    definition(t) {
        t.nonNull.list.field("link", {
            type: "Link",
            args: {
                id: nonNull(intArg()),
            },
            resolve(parent, args, context, info) {
                const link = [context.prisma.link.findUnique({
                    where: {
                        id: args.id
                    },
                })];

                return link;
            }
        });
    },
});

export const singleLinkMutation = extendType({
    type: "Mutation",
    definition(t) {
        t.nonNull.field("updateLink", {
            type: "Link",
            args: {
                id: nonNull(intArg()),
                url: nonNull(stringArg()),
                description: nonNull(stringArg()),
            },
            resolve(parent, args, context, info) {
                ensureAuthMutation(context, "edit");

                const updatedLink = context.prisma.link.update({
                    where: {
                        id: args.id
                    },
                    data: {
                        description: args.description,
                        url: args.url,
                    },
                });

                return updatedLink;
            }
        }),
            t.nonNull.field("deleteLink", {
                type: "Link",
                args: {
                    id: nonNull(intArg()),
                },
                resolve(parent, args, context, info) {
                    ensureAuthMutation(context, "delete");

                    const deletedLink = context.prisma.link.delete({
                        where: {
                            id: args.id
                        }
                    });

                    return deletedLink;
                }
            })

    },
});