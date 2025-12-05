import { NextResponse } from "next/server";
import connection from "@/app/lib/database";

// 🔹 GET — Ambil semua user dengan pagination dan filter ATAU user spesifik
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id"); // Parameter ID untuk user spesifik
    const page = parseInt(searchParams.get("page")) || 1;
    const limit = parseInt(searchParams.get("limit")) || 20;
    const offset = (page - 1) * limit;
    const search = searchParams.get("search") || "";
    const role = searchParams.get("role") || "";

    // Jika ada parameter ID, ambil user spesifik
    if (id) {
      const [rows] = await connection.execute(
        `SELECT 
          id, 
          username, 
          email, 
          role, 
          image,
          is_banned as isBanned,
          is_verified as isVerified,
          created_at as createdAt
         FROM users 
         WHERE id = ?`,
        [id]
      );
      
      if (rows.length === 0) {
        return NextResponse.json({ error: "User tidak ditemukan." }, { status: 404 });
      }
      
      return NextResponse.json(rows[0]);
    }

    // Jika tidak ada ID, ambil semua user dengan filter
    let query = `
      SELECT 
        id, 
        username, 
        email, 
        role, 
        image,
        is_banned as isBanned,
        is_verified as isVerified,
        created_at as createdAt
      FROM users 
      WHERE 1=1
    `;
    
    const params = [];

    // Filter pencarian
    if (search) {
      query += ` AND (username LIKE ? OR email LIKE ?)`;
      params.push(`%${search}%`, `%${search}%`);
    }

    // Filter role
    if (role) {
      query += ` AND role = ?`;
      params.push(role);
    }

    // Hitung total
    const countQuery = query.replace(/SELECT.*FROM/i, "SELECT COUNT(*) as total FROM");
    const [countRows] = await connection.execute(countQuery, params);
    const total = countRows[0]?.total || 0;

    // Query dengan pagination
    query += ` ORDER BY id DESC LIMIT ? OFFSET ?`;
    params.push(limit, offset);

    const [rows] = await connection.execute(query, params);

    return NextResponse.json({
      users: rows,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    console.error("❌ Error GET /users:", err);
    return NextResponse.json({ error: "Gagal mengambil data users." }, { status: 500 });
  }
}

// 🔹 POST — Ambil user by ID (alternatif)
export async function POST(req) {
  try {
    const { id } = await req.json();
    
    if (!id) {
      return NextResponse.json({ error: "ID tidak diberikan." }, { status: 400 });
    }

    const [rows] = await connection.execute(
      `SELECT 
        id, 
        username, 
        email, 
        role, 
        image,
        is_banned as isBanned,
        is_verified as isVerified,
        created_at as createdAt
       FROM users 
       WHERE id = ?`,
      [id]
    );
    
    if (rows.length === 0) {
      return NextResponse.json({ error: "User tidak ditemukan." }, { status: 404 });
    }

    return NextResponse.json(rows[0]);
  } catch (err) {
    console.error("❌ Error POST /users:", err);
    return NextResponse.json({ error: "Gagal mengambil user." }, { status: 500 });
  }
}

// 🔹 DELETE user
export async function DELETE(req) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    console.log("DELETE request for user ID:", id);

    if (!id) {
      return NextResponse.json({ error: "ID user diperlukan." }, { status: 400 });
    }

    // Cek jika user ada
    const [checkRows] = await connection.execute(
      "SELECT id, role, username, email FROM users WHERE id = ?",
      [id]
    );

    if (checkRows.length === 0) {
      return NextResponse.json({ error: "User tidak ditemukan." }, { status: 404 });
    }

    const user = checkRows[0];
    console.log("User to delete:", user);

    // Cek jika user adalah admin
    if (user.role === 'admin') {
      const [adminCount] = await connection.execute(
        "SELECT COUNT(*) as count FROM users WHERE role = 'admin' AND id != ?",
        [id]
      );
      
      console.log("Admin count (excluding this user):", adminCount[0].count);
      
      if (adminCount[0].count === 0) {
        return NextResponse.json({ 
          error: "Tidak dapat menghapus admin terakhir." 
        }, { status: 400 });
      }
    }
    
    // Cek jika user adalah petugas (tambahkan validasi ini)
    if (user.role === 'petugas') {
      const [petugasCount] = await connection.execute(
        "SELECT COUNT(*) as count FROM users WHERE role = 'petugas' AND id != ?",
        [id]
      );
      
      console.log("Petugas count (excluding this user):", petugasCount[0].count);
      
      // Biarkan petugas dihapus jika masih ada petugas lain
      // Tidak perlu mencegah penghapusan petugas seperti admin
    }

    // Hapus user
    console.log("Executing DELETE query for user ID:", id);
    const result = await connection.execute(
      "DELETE FROM users WHERE id = ?",
      [id]
    );
    
    console.log("DELETE result:", result);

    return NextResponse.json({ 
      success: true, 
      message: `User ${user.username} (${user.email}) berhasil dihapus.`,
      deletedUser: user
    });
  } catch (err) {
    console.error("❌ Error DELETE /users:", err);
    console.error("Error details:", err.message, err.code);
    
    // Cek jika error karena foreign key constraint
    if (err.code === 'ER_ROW_IS_REFERENCED_2' || err.code === '1451' || 
        err.message?.includes('foreign key constraint') || 
        err.message?.includes('a foreign key constraint fails')) {
      
      // Cek tabel apa yang memiliki foreign key ke users
      const [constraints] = await connection.execute(`
        SELECT 
          TABLE_NAME,
          COLUMN_NAME,
          CONSTRAINT_NAME,
          REFERENCED_TABLE_NAME,
          REFERENCED_COLUMN_NAME
        FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
        WHERE REFERENCED_TABLE_NAME = 'users' 
          AND TABLE_SCHEMA = DATABASE()
      `);
      
      console.log("Foreign key constraints found:", constraints);
      
      return NextResponse.json({ 
        error: "User tidak dapat dihapus karena memiliki data terkait di sistem. Harap hapus data terkait terlebih dahulu.",
        constraints: constraints
      }, { status: 400 });
    }
    
    return NextResponse.json({ 
      error: "Gagal menghapus user.",
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    }, { status: 500 });
  }
}

// 🔹 UPDATE role user
export async function PUT(req) {
  try {
    const body = await req.json();
    const { id, role } = body;

    if (!id || !role) {
      return NextResponse.json({ error: "ID dan role diperlukan." }, { status: 400 });
    }

    // Validasi role (ganti 'moderator' dengan 'petugas')
    const validRoles = ['user', 'admin', 'petugas'];
    if (!validRoles.includes(role)) {
      return NextResponse.json({ 
        error: `Role "${role}" tidak valid. Role yang valid: user, admin, petugas` 
      }, { status: 400 });
    }

    // Cek jika user ada
    const [checkRows] = await connection.execute(
      "SELECT id, role, username FROM users WHERE id = ?",
      [id]
    );

    if (checkRows.length === 0) {
      return NextResponse.json({ error: "User tidak ditemukan." }, { status: 404 });
    }

    const currentUser = checkRows[0];
    
    // Cek jika mencoba mengubah role admin terakhir menjadi non-admin
    if (currentUser.role === 'admin' && role !== 'admin') {
      const [otherAdmins] = await connection.execute(
        "SELECT COUNT(*) as count FROM users WHERE role = 'admin' AND id != ?",
        [id]
      );
      
      if (otherAdmins[0].count === 0) {
        return NextResponse.json({ 
          error: "Tidak dapat mengubah role admin terakhir menjadi non-admin." 
        }, { status: 400 });
      }
    }

    // Update role
    await connection.execute(
      "UPDATE users SET role = ? WHERE id = ?",
      [role, id]
    );

    const roleDisplayName = role === 'petugas' ? 'Petugas' : 
                           role === 'admin' ? 'Admin' : 'User';

    return NextResponse.json({ 
      success: true, 
      message: `Role user "${currentUser.username}" berhasil diubah menjadi ${roleDisplayName}.`,
      updatedUser: {
        id,
        role,
        previousRole: currentUser.role
      }
    });
  } catch (err) {
    console.error("❌ Error PUT /users:", err);
    return NextResponse.json({ error: "Gagal mengupdate role user." }, { status: 500 });
  }
}

// 🔹 PATCH — Update status user (ban/unban)
export async function PATCH(req) {
  try {
    const body = await req.json();
    const { id, isBanned } = body;

    if (!id) {
      return NextResponse.json({ error: "ID user diperlukan." }, { status: 400 });
    }

    // Cek jika user ada
    const [checkRows] = await connection.execute(
      "SELECT id, username, role FROM users WHERE id = ?",
      [id]
    );

    if (checkRows.length === 0) {
      return NextResponse.json({ error: "User tidak ditemukan." }, { status: 404 });
    }

    const user = checkRows[0];
    
    // Tidak boleh ban admin
    if (isBanned && user.role === 'admin') {
      return NextResponse.json({ 
        error: "Tidak dapat membanned user dengan role Admin." 
      }, { status: 400 });
    }

    // Update status banned
    await connection.execute(
      "UPDATE users SET is_banned = ? WHERE id = ?",
      [isBanned ? 1 : 0, id]
    );

    const action = isBanned ? 'dibanned' : 'dibuka blokirnya';
    
    return NextResponse.json({ 
      success: true, 
      message: `User "${user.username}" berhasil ${action}.`,
      updatedUser: {
        id,
        username: user.username,
        isBanned,
        previousStatus: !isBanned
      }
    });
  } catch (err) {
    console.error("❌ Error PATCH /users:", err);
    return NextResponse.json({ error: "Gagal mengupdate status user." }, { status: 500 });
  }
}