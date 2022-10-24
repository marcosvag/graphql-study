import { extendType, intArg, nonNull, objectType, stringArg } from "nexus";
import { NexusGenObjects } from "../../nexus-typegen";

export const Link = objectType({
    name: "Link",
    definition(t) {
        t.nonNull.int("id");
        t.nonNull.string("description");
        t.nonNull.string("url");
    },
});

let links: NexusGenObjects["Link"][] = [
    {
        id: 1,
        url: "www.howtographql.com",
        description: "Fullstack tutorial for GraphQL",
    },
    {
        id: 2,
        url: "graphql.org",
        description: "GraphQL official website",
    },
];

export const LinkQuery = extendType({
    type: "Query",
    definition(t) {
        t.nonNull.list.nonNull.field("feed", {
            type: "Link",
            resolve(parent, args, context, info) {
                return links
            }
        })
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
                const { description, url } = args;

                let idCount = links.length + 1;
                const link = {
                    id: idCount,
                    description: description,
                    url: url,
                };
                links.push(link);
                return link;
            }
        })
    },
})

export const singleLinkQuery = extendType({
    type: "Query",
    definition(t) {
        t.nonNull.list.field("link", {
            type: "Link",
            args: {
                id: nonNull(intArg()),
            },
            resolve(parent, args, context, info) {
                const { id } = args;

                return links.filter(el => el.id === id);
            }
        })
    },
})

export const singleLinkMutation =  extendType({
    type: "Mutation",
    definition(t) {
        t.nonNull.field("updateLink", {
            type: "Link",
            args: {
                id: nonNull(intArg()),
                url: stringArg(),
                description: stringArg(),
            },
            resolve(parent, args, context, info) {
                const { id, url, description} = args;

                let link = links.filter(link => link.id === id);

                if(url) link[0].url = url;
                if(description) link[0].description = description;
                
                console.log(link)

                return link[0]
            }
        }),
        t.nonNull.field("deleteLink", {
            type: "Link",
            args: {
                id: nonNull(intArg()),
            },
            resolve(parent, args, context, info) {
                const { id } = args
                let deletedBaseLink = {
                     id: id, 
                     description: "Not found", 
                     url: "Not found",
                    };
                links = links.filter( (link) => {
                    if(link.id == id) {
                        deletedBaseLink = link
                        return false
                    }else {
                        return true
                    }
                })
                return deletedBaseLink
            }
        })
        
    },
})