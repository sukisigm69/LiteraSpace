import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";

// **Named export** untuk App Router
export async function PUT(req) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.id) {
      return new Response(JSON.stringify({ message: "Unauthorized" }), { status: 401 });
    }

    const { name, email, image } = await req.json();

    // Update user sesuai model Prisma (sesuaikan dengan schema: users/user)
    const user = await prisma.users.update({
      where: { id: session.user.id },
      data: {
        username: name,
        email,
        profile_image: image || "https://i.pinimg.com/736x/ef/ed/b2/efedb22a7a6f6e4a18deb432228d137b.jpg",
      },
    });

    return new Response(JSON.stringify({ user }), { status: 200 });
  } catch (error) {
    console.error("Error update user:", error);
    return new Response(JSON.stringify({ message: "Gagal memperbarui profil" }), { status: 500 });
  }
}
